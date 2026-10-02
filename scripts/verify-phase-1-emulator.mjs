import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import nextEnv from "@next/env";
import { deleteApp, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import postgres from "postgres";

nextEnv.loadEnvConfig(process.cwd());

const PROJECT_ID = "demo-beaver-ai";
const APP_PORT = 3210;
const APP_ORIGIN = `http://127.0.0.1:${APP_PORT}`;
const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;

if (!emulatorHost || !/^(127\.0\.0\.1|localhost):\d+$/.test(emulatorHost)) {
  throw new Error(
    "Run this verification through the local Firebase Auth emulator.",
  );
}
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for Phase 1 verification.");
}

const authBase = `http://${emulatorHost}/identitytoolkit.googleapis.com/v1/accounts`;
const secureTokenBase = `http://${emulatorHost}/securetoken.googleapis.com/v1/token`;
const apiKey = "demo-api-key";
const runId = `${Date.now()}-${randomBytes(4).toString("hex")}`;
const emailFor = (name) => `phase1-${name}-${runId}@example.test`;
const password = `V!${randomBytes(18).toString("base64url")}9a`;
const database = postgres(process.env.DATABASE_URL, { max: 1 });
const adminApp = initializeApp({ projectId: PROJECT_ID }, `phase1-${runId}`);
const adminAuth = getAuth(adminApp);
const firebaseUsers = new Set();
const firebaseTokens = new Set();
const accountIds = new Set();
const auditTargetIds = new Set();
const checks = [];
let server;
let serverOutput = "";

function check(condition, description) {
  if (!condition) {
    throw new Error(`Verification failed: ${description}`);
  }
  checks.push(description);
}

async function authRequest(action, body) {
  const response = await fetch(`${authBase}:${action}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

async function createPasswordUser(name) {
  const email = emailFor(name);
  const signup = await authRequest("signUp", {
    email,
    password,
    returnSecureToken: true,
  });
  check(signup.response.ok, `${name} registers with email and password`);
  firebaseUsers.add(signup.payload.localId);
  firebaseTokens.add(signup.payload.idToken);

  await adminAuth.updateUser(signup.payload.localId, { emailVerified: true });
  const signin = await authRequest("signInWithPassword", {
    email,
    password,
    returnSecureToken: true,
  });
  check(signin.response.ok, `${name} signs in with email and password`);
  check(
    signin.payload.localId === signup.payload.localId,
    `${name} repeat authentication preserves Firebase identity`,
  );
  firebaseTokens.add(signin.payload.idToken);
  return {
    email,
    uid: signin.payload.localId,
    token: signin.payload.idToken,
    refreshToken: signin.payload.refreshToken,
  };
}

function fakeGoogleToken(subject, email) {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    iss: "https://accounts.google.com",
    aud: "demo-client",
    sub: subject,
    email,
    email_verified: true,
    name: "Phase 1 Google User",
    iat: now,
    exp: now + 3600,
  })}.`;
}

async function signInWithGoogle(subject, email, currentIdToken) {
  const request = {
    requestUri: APP_ORIGIN,
    postBody: new URLSearchParams({
      id_token: fakeGoogleToken(subject, email),
      providerId: "google.com",
    }).toString(),
    returnIdpCredential: true,
    returnSecureToken: true,
  };
  if (currentIdToken) {
    request.idToken = currentIdToken;
  }
  const result = await authRequest("signInWithIdp", request);
  check(result.response.ok, "Google authentication completes in the emulator");
  firebaseUsers.add(result.payload.localId);
  firebaseTokens.add(result.payload.idToken);
  return {
    email: result.payload.email,
    uid: result.payload.localId,
    token: result.payload.idToken,
  };
}

async function api(path, token, init = {}) {
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");
  const response = await fetch(`${APP_ORIGIN}${path}`, {
    ...init,
    headers,
  });
  const payload =
    response.status === 204 ? null : await response.json().catch(() => ({}));
  return { response, payload };
}

async function synchronizeAccount(user) {
  const result = await api("/api/account", user.token, { method: "POST" });
  check(
    result.response.status === 200,
    `${user.email} synchronizes an account`,
  );
  accountIds.add(result.payload.account.id);
  auditTargetIds.add(result.payload.account.id);
  return result.payload.account;
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      throw new Error(`Application server exited early.\n${serverOutput}`);
    }
    try {
      const response = await fetch(APP_ORIGIN);
      if (response.ok) return;
    } catch {
      // The server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Application server did not become ready.\n${serverOutput}`);
}

async function stopServer() {
  if (!server || server.exitCode !== null) return;
  server.kill("SIGTERM");
  await Promise.race([
    new Promise((resolve) => server.once("exit", resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

async function cleanup() {
  await stopServer();

  for (const uid of firebaseUsers) {
    await adminAuth.deleteUser(uid).catch(() => undefined);
  }

  const emails = ["owner", "recipient", "outsider", "google"].map((name) =>
    emailFor(name),
  );
  await database`delete from accounts where normalized_email in ${database(emails)}`;

  const targets = [...auditTargetIds];
  if (targets.length > 0) {
    await database`delete from account_audit_events where target_id in ${database(targets)}`;
  }

  await database.end();
  await deleteApp(adminApp);
}

async function run() {
  server = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "-p", String(APP_PORT)],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        FIREBASE_PROJECT_ID: PROJECT_ID,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: PROJECT_ID,
        FIREBASE_AUTH_EMULATOR_HOST: emulatorHost,
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  for (const stream of [server.stdout, server.stderr]) {
    stream.on("data", (chunk) => {
      serverOutput = `${serverOutput}${chunk.toString()}`.slice(-12_000);
    });
  }
  await waitForServer();

  const health = await fetch(APP_ORIGIN);
  check(health.status === 200, "production application starts successfully");

  const noAuth = await fetch(`${APP_ORIGIN}/api/account`);
  check(noAuth.status === 401, "protected API rejects missing credentials");
  check(
    noAuth.headers.get("cache-control") === "no-store",
    "protected API errors are not cacheable",
  );

  const invalidAuth = await fetch(`${APP_ORIGIN}/api/account`, {
    headers: { Authorization: "Bearer invalid-token" },
  });
  check(
    invalidAuth.status === 401,
    "protected API rejects invalid credentials",
  );

  const owner = await createPasswordUser("owner");
  const recipient = await createPasswordUser("recipient");
  const outsider = await createPasswordUser("outsider");

  const refresh = await fetch(`${secureTokenBase}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: owner.refreshToken,
    }),
  });
  const refreshed = await refresh.json();
  check(refresh.ok, "Firebase session refresh succeeds");
  check(
    refreshed.user_id === owner.uid,
    "session refresh preserves Firebase identity",
  );
  firebaseTokens.add(refreshed.id_token);
  owner.token = refreshed.id_token;

  const recovery = await authRequest("sendOobCode", {
    requestType: "PASSWORD_RESET",
    email: owner.email,
  });
  check(recovery.response.ok, "password recovery request succeeds");

  const ownerAccount = await synchronizeAccount(owner);
  const repeatedOwner = await synchronizeAccount(owner);
  check(
    repeatedOwner.id === ownerAccount.id,
    "repeated synchronization does not duplicate the Beaver account",
  );
  const recipientAccount = await synchronizeAccount(recipient);
  await synchronizeAccount(outsider);

  const update = await api("/api/account", owner.token, {
    method: "PATCH",
    body: JSON.stringify({ displayName: "Phase 1 Owner" }),
  });
  check(
    update.response.status === 200 &&
      update.payload.account.displayName === "Phase 1 Owner",
    "display-name update persists",
  );

  let invalidStoredScopeRejected = false;
  try {
    await database`insert into sharing_invitations (
      owner_account_id,
      recipient_email,
      normalized_recipient_email,
      relationship_type,
      permission_scopes,
      token_hash,
      status,
      expires_at,
      created_at,
      updated_at
    ) values (
      ${ownerAccount.id},
      ${recipient.email},
      ${recipient.email},
      'educator',
      ${database.json(["learning_time"])},
      ${randomBytes(32).toString("hex")},
      'pending',
      ${new Date(Date.now() + 60_000)},
      ${new Date()},
      ${new Date()}
    )`;
  } catch (error) {
    invalidStoredScopeRejected = error?.code === "23514";
  }
  check(
    invalidStoredScopeRejected,
    "database constraint rejects invalid relationship permission scopes",
  );

  const linkedGoogle = await signInWithGoogle(
    `linked-${runId}`,
    owner.email,
    owner.token,
  );
  check(
    linkedGoogle.uid === owner.uid,
    "explicit Google linking preserves the Firebase identity",
  );
  const linkedAccount = await synchronizeAccount(linkedGoogle);
  check(
    linkedAccount.id === ownerAccount.id,
    "linked Google authentication preserves the Beaver account",
  );
  owner.token = linkedGoogle.token;

  const googleEmail = emailFor("google");
  const google = await signInWithGoogle(`google-${runId}`, googleEmail);
  const googleAccount = await synchronizeAccount(google);
  const repeatedGoogle = await signInWithGoogle(`google-${runId}`, googleEmail);
  const repeatedGoogleAccount = await synchronizeAccount(repeatedGoogle);
  check(
    repeatedGoogle.uid === google.uid &&
      repeatedGoogleAccount.id === googleAccount.id,
    "repeat Google sign-in does not create duplicate identities or accounts",
  );
  google.token = repeatedGoogle.token;

  const invalidEducatorScope = await api(
    "/api/sharing/invitations",
    owner.token,
    {
      method: "POST",
      body: JSON.stringify({
        recipientEmail: recipient.email,
        relationshipType: "educator",
        permissionScopes: ["learning_time"],
      }),
    },
  );
  check(
    invalidEducatorScope.response.status === 422,
    "relationship scope allowlist rejects educator learning-time access",
  );

  const invitationResult = await api("/api/sharing/invitations", owner.token, {
    method: "POST",
    body: JSON.stringify({
      recipientEmail: recipient.email,
      relationshipType: "parent",
      permissionScopes: ["learning_time", "academic_progress"],
    }),
  });
  check(
    invitationResult.response.status === 201,
    "student creates a scoped parent invitation",
  );
  check(
    invitationResult.response.headers.get("cache-control") === "no-store",
    "raw invitation-token responses are not cacheable",
  );
  const { invitation, token } = invitationResult.payload;
  auditTargetIds.add(invitation.id);

  const [storedInvitation] =
    await database`select token_hash, status, expires_at from sharing_invitations where id = ${invitation.id}`;
  check(
    storedInvitation.token_hash !== token &&
      /^[0-9a-f]{64}$/.test(storedInvitation.token_hash),
    "only the invitation token hash is stored",
  );
  check(
    storedInvitation.status === "pending" &&
      storedInvitation.expires_at > new Date(),
    "invitation is pending and expires in the future",
  );

  const wrongRecipient = await api(
    "/api/sharing/invitations/accept",
    outsider.token,
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
  );
  check(
    wrongRecipient.response.status === 403,
    "invitation rejects the wrong authenticated recipient",
  );

  const accepted = await api(
    "/api/sharing/invitations/accept",
    recipient.token,
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
  );
  check(
    accepted.response.status === 200 &&
      accepted.payload.connection.status === "active",
    "matching verified recipient creates an active connection",
  );
  const connection = accepted.payload.connection;
  auditTargetIds.add(connection.id);

  const unauthorizedRevoke = await api(
    `/api/sharing/connections/${connection.id}`,
    recipient.token,
    { method: "DELETE" },
  );
  check(
    unauthorizedRevoke.response.status === 404,
    "recipient cannot revoke an owner-controlled connection",
  );

  const activePermission =
    await database`select exists(select 1 from sharing_connections where id = ${connection.id} and owner_account_id = ${ownerAccount.id} and recipient_account_id = ${recipientAccount.id} and status = 'active' and permission_scopes @> '["academic_progress"]'::jsonb) as allowed`;
  const absentPermission =
    await database`select exists(select 1 from sharing_connections where id = ${connection.id} and status = 'active' and permission_scopes @> '["concept_summary"]'::jsonb) as allowed`;
  check(
    activePermission[0].allowed && !absentPermission[0].allowed,
    "connection authorizes only explicitly granted scopes",
  );

  let invalidConnectionScopeRejected = false;
  try {
    await database`update sharing_connections set permission_scopes = ${database.json(["not_a_scope"])} where id = ${connection.id}`;
  } catch (error) {
    invalidConnectionScopeRejected = error?.code === "23514";
  }
  check(
    invalidConnectionScopeRejected,
    "database constraint rejects invalid connection scopes",
  );

  let selfConnectionRejected = false;
  try {
    await database`update sharing_connections set recipient_account_id = owner_account_id where id = ${connection.id}`;
  } catch (error) {
    selfConnectionRejected = error?.code === "23514";
  }
  check(
    selfConnectionRejected,
    "database constraint rejects self-referential sharing connections",
  );

  const revokeConnection = await api(
    `/api/sharing/connections/${connection.id}`,
    owner.token,
    { method: "DELETE" },
  );
  check(
    revokeConnection.response.status === 204,
    "student owner revokes the connection",
  );
  const revokedPermission =
    await database`select exists(select 1 from sharing_connections where id = ${connection.id} and status = 'active' and permission_scopes @> '["academic_progress"]'::jsonb) as allowed`;
  check(
    !revokedPermission[0].allowed,
    "revocation immediately removes scoped authorization",
  );

  const repeatedAcceptance = await api(
    "/api/sharing/invitations/accept",
    recipient.token,
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
  );
  check(
    repeatedAcceptance.response.status === 404,
    "accepted invitation token cannot be reused",
  );

  const expiringResult = await api("/api/sharing/invitations", owner.token, {
    method: "POST",
    body: JSON.stringify({
      recipientEmail: recipient.email,
      relationshipType: "educator",
      permissionScopes: ["academic_progress"],
    }),
  });
  check(
    expiringResult.response.status === 201,
    "student creates an educator invitation",
  );
  auditTargetIds.add(expiringResult.payload.invitation.id);
  await database`update sharing_invitations set expires_at = ${new Date(0)} where id = ${expiringResult.payload.invitation.id}`;
  const expiredAcceptance = await api(
    "/api/sharing/invitations/accept",
    recipient.token,
    {
      method: "POST",
      body: JSON.stringify({ token: expiringResult.payload.token }),
    },
  );
  check(
    expiredAcceptance.response.status === 410,
    "expired invitation cannot be accepted",
  );

  const pendingResult = await api("/api/sharing/invitations", owner.token, {
    method: "POST",
    body: JSON.stringify({
      recipientEmail: recipient.email,
      relationshipType: "parent",
      permissionScopes: ["concept_summary"],
    }),
  });
  check(
    pendingResult.response.status === 201,
    "student creates a second pending invitation",
  );
  auditTargetIds.add(pendingResult.payload.invitation.id);
  const revokeInvitation = await api(
    `/api/sharing/invitations/${pendingResult.payload.invitation.id}`,
    owner.token,
    { method: "DELETE" },
  );
  check(
    revokeInvitation.response.status === 204,
    "student revokes a pending invitation",
  );

  const ownerOverview = await api("/api/sharing/invitations", owner.token);
  const recipientOverview = await api(
    "/api/sharing/invitations",
    recipient.token,
  );
  check(
    ownerOverview.response.status === 200 &&
      recipientOverview.response.status === 200,
    `both sides can retrieve their own sharing overview (owner ${ownerOverview.response.status}/${ownerOverview.payload?.error?.code ?? "ok"}, recipient ${recipientOverview.response.status}/${recipientOverview.payload?.error?.code ?? "ok"})`,
  );
  check(
    ownerOverview.response.headers.get("cache-control") === "no-store",
    "account sharing state responses are not cacheable",
  );
  check(
    ownerOverview.payload.sharing.ownedConnections.some(
      (item) => item.id === connection.id && item.status === "revoked",
    ) &&
      recipientOverview.payload.sharing.receivedConnections.some(
        (item) => item.id === connection.id && item.status === "revoked",
      ),
    "sharing overview reflects revoked state without granting access",
  );

  const malformedResource = await api(
    "/api/sharing/connections/not-a-uuid",
    owner.token,
    { method: "DELETE" },
  );
  check(
    malformedResource.response.status === 422,
    "malformed sharing IDs are rejected before database access",
  );

  const outsiderOwnerRevoke = await api(
    `/api/sharing/invitations/${expiringResult.payload.invitation.id}`,
    outsider.token,
    { method: "DELETE" },
  );
  check(
    outsiderOwnerRevoke.response.status === 404,
    "another account cannot mutate the student's invitation",
  );

  const deleteOwner = await api("/api/account", owner.token, {
    method: "DELETE",
  });
  check(
    deleteOwner.response.status === 204,
    "recently authenticated owner deletes the account",
  );
  const deletedOwnerRequest = await api("/api/account", owner.token, {
    method: "POST",
  });
  check(
    deletedOwnerRequest.response.status === 401,
    "deleted Firebase identity can no longer access protected APIs",
  );
  const ownerRows =
    await database`select count(*)::int as count from accounts where id = ${ownerAccount.id}`;
  const ownerSharingRows =
    await database`select count(*)::int as count from sharing_connections where owner_account_id = ${ownerAccount.id}`;
  check(
    ownerRows[0].count === 0 && ownerSharingRows[0].count === 0,
    "account deletion removes Beaver account and owned sharing data",
  );

  for (const user of [recipient, outsider, google]) {
    const deletion = await api("/api/account", user.token, {
      method: "DELETE",
    });
    check(
      deletion.response.status === 204,
      `synthetic ${user.email} account is deleted through the application`,
    );
  }

  const remaining =
    await database`select count(*)::int as count from accounts where normalized_email like ${`phase1-%-${runId}@example.test`}`;
  check(
    remaining[0].count === 0,
    "verification leaves no synthetic account records",
  );

  console.log(
    JSON.stringify(
      {
        status: "PASS",
        checks: checks.length,
        coverage: [
          "Firebase Admin token verification and revocation",
          "email/password registration, sign-in, refresh, and recovery",
          "Google creation, repeat sign-in, and explicit linking",
          "Beaver account synchronization, update, and deletion",
          "invitation creation, hashing, recipient matching, expiry, and reuse",
          "scoped connection authorization, ownership, and revocation",
        ],
      },
      null,
      2,
    ),
  );
}

try {
  await run();
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "Verification failed.",
  );
  if (serverOutput) console.error(serverOutput);
  process.exitCode = 1;
} finally {
  await cleanup();
}
