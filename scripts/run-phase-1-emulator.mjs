import { existsSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";

const environment = { ...process.env };

if (process.platform === "win32" && !environment.JAVA_HOME) {
  const portableRoot = join(
    environment.LOCALAPPDATA ?? join(homedir(), "AppData", "Local"),
    "BeaverAI",
    "tools",
    "jre21",
  );
  if (existsSync(portableRoot)) {
    const installation = readdirSync(portableRoot, {
      withFileTypes: true,
    }).find(
      (entry) =>
        entry.isDirectory() &&
        existsSync(join(portableRoot, entry.name, "bin", "java.exe")),
    );
    if (installation) {
      environment.JAVA_HOME = join(portableRoot, installation.name);
      environment.PATH = `${join(environment.JAVA_HOME, "bin")};${environment.PATH ?? ""}`;
    }
  }
}

const firebaseArguments = [
  "--yes",
  "firebase-tools@15.32.1",
  "emulators:exec",
  "--only",
  "auth",
  "--project",
  "demo-beaver-ai",
  "node scripts/verify-phase-1-emulator.mjs",
];
const command = process.platform === "win32" ? "powershell.exe" : "npx";
const commandArguments =
  process.platform === "win32"
    ? [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "npx --yes firebase-tools@15.32.1 emulators:exec --only auth --project demo-beaver-ai 'node scripts/verify-phase-1-emulator.mjs'",
      ]
    : firebaseArguments;
const child = spawn(command, commandArguments, {
  cwd: process.cwd(),
  env: environment,
  stdio: "inherit",
});

child.once("error", (error) => {
  console.error(`Firebase emulator could not start: ${error.message}`);
  process.exitCode = 1;
});
child.once("exit", (code, signal) => {
  if (signal) {
    console.error(`Firebase emulator stopped by ${signal}.`);
    process.exitCode = 1;
    return;
  }
  process.exitCode = code ?? 1;
});
