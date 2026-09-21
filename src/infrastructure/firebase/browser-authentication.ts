"use client";

import { FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  linkWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { configureFirebaseAuth, getFirebaseAuth } from "./client";

export async function registerWithEmail(
  email: string,
  password: string,
): Promise<User> {
  if (password.length < 8) {
    throw new FirebaseError(
      "auth/weak-password",
      "Password must have at least 8 characters.",
    );
  }
  const auth = await configureFirebaseAuth();
  const result = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  await sendEmailVerification(result.user);
  return result.user;
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<User> {
  const auth = await configureFirebaseAuth();
  const result = await signInWithEmailAndPassword(auth, email.trim(), password);
  return result.user;
}

export async function signInWithGoogle(): Promise<User> {
  const auth = await configureFirebaseAuth();
  const provider = googleProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function linkGoogleIdentity(user: User): Promise<void> {
  await configureFirebaseAuth();
  await linkWithPopup(user, googleProvider());
  await user.getIdToken(true);
}

export async function requestPasswordReset(email: string): Promise<void> {
  const auth = await configureFirebaseAuth();
  await sendPasswordResetEmail(auth, email.trim());
}

export async function signOutFromFirebase(): Promise<void> {
  await signOut(getFirebaseAuth());
}

function googleProvider(): GoogleAuthProvider {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return provider;
}
