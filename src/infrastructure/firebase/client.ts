"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  type Auth,
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  setPersistence,
} from "firebase/auth";

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

let configured = false;

export function getFirebaseAuth(): Auth {
  const app =
    getApps().length > 0
      ? getApp()
      : initializeApp({
          apiKey: required(
            "NEXT_PUBLIC_FIREBASE_API_KEY",
            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
          ),
          authDomain: required(
            "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
            process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
          ),
          projectId: required(
            "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          ),
          appId: required(
            "NEXT_PUBLIC_FIREBASE_APP_ID",
            process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
          ),
        });
  return getAuth(app);
}

export async function configureFirebaseAuth(): Promise<Auth> {
  const firebaseAuth = getFirebaseAuth();
  if (configured) {
    return firebaseAuth;
  }

  const emulatorHost =
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST?.trim();
  if (emulatorHost) {
    connectAuthEmulator(firebaseAuth, `http://${emulatorHost}`, {
      disableWarnings: true,
    });
  }
  await setPersistence(firebaseAuth, browserLocalPersistence);
  configured = true;
  return firebaseAuth;
}
