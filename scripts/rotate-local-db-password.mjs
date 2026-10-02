import { randomBytes } from "node:crypto";
import { chmod, readFile, rename, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import nextEnv from "@next/env";
import postgres from "postgres";

nextEnv.loadEnvConfig(process.cwd());

const environmentPath = resolve(".env.local");
const temporaryPath = resolve(".env.rotate.local");
const configuredUrl = process.env.DATABASE_URL;

if (!configuredUrl) {
  throw new Error("DATABASE_URL is not configured in .env.local.");
}

const currentUrl = new URL(configuredUrl);
if (!["postgres:", "postgresql:"].includes(currentUrl.protocol)) {
  throw new Error("DATABASE_URL must use PostgreSQL.");
}
if (!["localhost", "127.0.0.1", "[::1]"].includes(currentUrl.hostname)) {
  throw new Error("Refusing to rotate a non-local PostgreSQL credential.");
}
if (!currentUrl.username || !currentUrl.password) {
  throw new Error("DATABASE_URL must contain the local application role.");
}

const currentEnvironment = await readFile(environmentPath, "utf8");
const matches = currentEnvironment.match(/^DATABASE_URL=.*$/gm) ?? [];
if (matches.length !== 1) {
  throw new Error(".env.local must contain exactly one DATABASE_URL entry.");
}

const newPassword = randomBytes(32).toString("base64url");
const nextUrl = new URL(currentUrl);
nextUrl.password = newPassword;
const nextEnvironment = currentEnvironment.replace(
  /^DATABASE_URL=.*$/m,
  `DATABASE_URL=${JSON.stringify(nextUrl.toString())}`,
);

await writeFile(temporaryPath, nextEnvironment, {
  encoding: "utf8",
  mode: 0o600,
});
await chmod(temporaryPath, 0o600).catch(() => undefined);

const currentDatabase = postgres(currentUrl.toString(), { max: 1 });
let rotated = false;

async function alterPassword(database, role, password) {
  const [quoted] = await database`
    select quote_ident(${role}) as role, quote_literal(${password}) as password
  `;
  await database.unsafe(
    `alter role ${quoted.role} with password ${quoted.password}`,
  );
}

try {
  const [identity] =
    await currentDatabase`select current_user as role, current_database() as database`;
  const configuredRole = decodeURIComponent(currentUrl.username);
  if (identity.role !== configuredRole) {
    throw new Error(
      "DATABASE_URL does not authenticate as its configured PostgreSQL role.",
    );
  }

  await alterPassword(currentDatabase, identity.role, newPassword);
  rotated = true;

  const verificationDatabase = postgres(nextUrl.toString(), { max: 1 });
  try {
    const [verified] =
      await verificationDatabase`select current_user as role, current_database() as database`;
    if (
      verified.role !== identity.role ||
      verified.database !== identity.database
    ) {
      throw new Error("The rotated credential reached an unexpected database.");
    }
  } finally {
    await verificationDatabase.end();
  }

  await rename(temporaryPath, environmentPath);
  await chmod(environmentPath, 0o600).catch(() => undefined);
  console.log(
    "Local PostgreSQL password rotated and .env.local updated successfully.",
  );
} catch (error) {
  if (rotated) {
    const oldPassword = decodeURIComponent(currentUrl.password);
    await alterPassword(
      currentDatabase,
      decodeURIComponent(currentUrl.username),
      oldPassword,
    ).catch(() => undefined);
  }
  await rm(temporaryPath, { force: true }).catch(() => undefined);
  throw new Error(
    `Local PostgreSQL password rotation failed safely (${error?.code ?? "unknown_error"}).`,
  );
} finally {
  await currentDatabase.end();
}
