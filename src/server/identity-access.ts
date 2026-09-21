import type { NextRequest } from "next/server";
import { getDatabase } from "@/infrastructure/database/client";
import { PostgresIdentityAccessRepository } from "@/infrastructure/database/identity-access-repository";
import {
  FirebaseIdentityAdministration,
  verifyFirebaseToken,
} from "@/infrastructure/firebase/admin";
import {
  type Account,
  type AuthenticatedIdentity,
} from "@/modules/identity-access/model";
import { IdentityAccessService } from "@/modules/identity-access/service";

let service: IdentityAccessService | undefined;

export function getIdentityAccessService(): IdentityAccessService {
  if (!service) {
    service = new IdentityAccessService(
      new PostgresIdentityAccessRepository(getDatabase()),
      new FirebaseIdentityAdministration(),
    );
  }
  return service;
}

export interface RequestActor {
  account: Account;
  identity: AuthenticatedIdentity;
}

export async function authenticateRequest(
  request: NextRequest,
): Promise<RequestActor> {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new HttpError(401, "authentication_required", "Sign in to continue.");
  }

  let identity: AuthenticatedIdentity;
  try {
    identity = await verifyFirebaseToken(authorization.slice(7));
  } catch {
    throw new HttpError(
      401,
      "invalid_authentication",
      "Your session is invalid or expired. Sign in again.",
    );
  }

  const account = await getIdentityAccessService().synchronizeAccount(identity);
  return { account, identity };
}

export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}
