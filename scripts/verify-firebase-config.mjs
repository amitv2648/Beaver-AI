import nextEnv from "@next/env";

nextEnv.loadEnvConfig(process.cwd());

const requiredVariables = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
  "FIREBASE_PROJECT_ID",
];
const missing = requiredVariables.filter((name) => !process.env[name]?.trim());

if (missing.length > 0) {
  throw new Error(
    `Firebase configuration is incomplete. Missing: ${missing.join(", ")}.`,
  );
}

const clientProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID.trim();
const serverProjectId = process.env.FIREBASE_PROJECT_ID.trim();
const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN.trim();
const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID.trim();
const emulatorHost =
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST?.trim();

if (serverProjectId !== clientProjectId) {
  throw new Error(
    "FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_PROJECT_ID must identify the same Firebase project.",
  );
}

const expectedAuthDomains = new Set([
  `${clientProjectId}.firebaseapp.com`,
  `${clientProjectId}.web.app`,
]);
if (!expectedAuthDomains.has(authDomain)) {
  throw new Error(
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN does not match NEXT_PUBLIC_FIREBASE_PROJECT_ID.",
  );
}

if (emulatorHost) {
  console.log(
    "Firebase client/server project values are aligned; remote API-key validation was skipped because the browser Auth emulator is configured.",
  );
  process.exit(0);
}

const appProjectNumber = /^1:(\d+):web:/.exec(appId)?.[1];
if (!appProjectNumber) {
  throw new Error(
    "NEXT_PUBLIC_FIREBASE_APP_ID is not a valid Firebase Web App ID.",
  );
}

const response = await fetch(
  `https://identitytoolkit.googleapis.com/v1/projects?key=${encodeURIComponent(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  )}`,
);
const project = await response.json().catch(() => ({}));

if (!response.ok) {
  throw new Error(
    `Firebase rejected the configured Web API key (${project.error?.status ?? `HTTP ${response.status}`}).`,
  );
}
// Despite its name, Identity Toolkit's projectId field may contain either the
// textual project ID or the numeric project number.
if (
  project.projectId !== clientProjectId &&
  project.projectId !== appProjectNumber
) {
  throw new Error(
    "NEXT_PUBLIC_FIREBASE_API_KEY belongs to a different Firebase project than the configured project and Web App. Copy the complete Web App configuration as one block from Firebase Console.",
  );
}
if (
  Array.isArray(project.authorizedDomains) &&
  !project.authorizedDomains.includes("localhost")
) {
  throw new Error(
    "Firebase Authentication does not list localhost as an authorized domain.",
  );
}

console.log(
  "Firebase Web API key, Auth domain, client project, server project, and localhost authorization are aligned.",
);
