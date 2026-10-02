import {
  type AppOptions,
  applicationDefault,
  getApp,
  getApps,
  initializeApp,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import type { AuthenticatedIdentity } from "@/modules/identity-access/model";
import type { IdentityAdministrationGateway } from "@/modules/identity-access/ports";

const rejectedIdentityCodes = new Set([
  "auth/argument-error",
  "auth/id-token-expired",
  "auth/id-token-revoked",
  "auth/invalid-id-token",
  "auth/tenant-id-mismatch",
  "auth/user-disabled",
  "auth/user-not-found",
]);

class FirebaseIdentityRejectedError extends Error {
  constructor() {
    super("The Firebase identity cannot be used.");
    this.name = "FirebaseIdentityRejectedError";
  }
}

export function isFirebaseIdentityRejected(error: unknown): boolean {
  if (error instanceof FirebaseIdentityRejectedError) {
    return true;
  }

  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return rejectedIdentityCodes.has(String(error.code));
}

function getAdminApp() {
  if (getApps().length > 0) {
    return getApp();
  }

  const projectId =
    process.env.FIREBASE_PROJECT_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error("FIREBASE_PROJECT_ID is not configured.");
  }

  const options: AppOptions = { projectId };
  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    options.credential = applicationDefault();
  }
  return initializeApp(options);
}

export async function verifyFirebaseToken(
  token: string,
): Promise<AuthenticatedIdentity> {
  const decoded = await getAuth(getAdminApp()).verifyIdToken(token, true);
  if (!decoded.email) {
    throw new FirebaseIdentityRejectedError();
  }

  const providerIds = Object.keys(decoded.firebase.identities ?? {}).filter(
    (providerId) => providerId !== "email",
  );
  if (
    decoded.firebase.sign_in_provider &&
    !providerIds.includes(decoded.firebase.sign_in_provider)
  ) {
    providerIds.push(decoded.firebase.sign_in_provider);
  }

  return {
    issuer: "firebase",
    subject: decoded.uid,
    email: decoded.email,
    emailVerified: decoded.email_verified ?? false,
    providerIds,
    authenticatedAt: new Date(decoded.auth_time * 1000),
  };
}

export class FirebaseIdentityAdministration implements IdentityAdministrationGateway {
  async deleteIdentity(subject: string): Promise<void> {
    await getAuth(getAdminApp()).deleteUser(subject);
  }
}
