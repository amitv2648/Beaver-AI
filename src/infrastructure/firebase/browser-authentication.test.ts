import { beforeEach, describe, expect, it, vi } from "vitest";
import type { User } from "firebase/auth";

const mocks = vi.hoisted(() => {
  const auth = { currentUser: null };
  const user = { getIdToken: vi.fn().mockResolvedValue("token") };
  return {
    auth,
    user,
    configureFirebaseAuth: vi.fn().mockResolvedValue(auth),
    getFirebaseAuth: vi.fn(() => auth),
    createUserWithEmailAndPassword: vi.fn().mockResolvedValue({ user }),
    sendEmailVerification: vi.fn().mockResolvedValue(undefined),
    signInWithEmailAndPassword: vi.fn().mockResolvedValue({ user }),
    signInWithPopup: vi.fn().mockResolvedValue({ user }),
    linkWithPopup: vi.fn().mockResolvedValue({ user }),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    setCustomParameters: vi.fn(),
  };
});

vi.mock("./client", () => ({
  configureFirebaseAuth: mocks.configureFirebaseAuth,
  getFirebaseAuth: mocks.getFirebaseAuth,
}));

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: class {
    setCustomParameters = mocks.setCustomParameters;
  },
  createUserWithEmailAndPassword: mocks.createUserWithEmailAndPassword,
  sendEmailVerification: mocks.sendEmailVerification,
  signInWithEmailAndPassword: mocks.signInWithEmailAndPassword,
  signInWithPopup: mocks.signInWithPopup,
  linkWithPopup: mocks.linkWithPopup,
  sendPasswordResetEmail: mocks.sendPasswordResetEmail,
  signOut: mocks.signOut,
}));

import {
  linkGoogleIdentity,
  registerWithEmail,
  requestPasswordReset,
  signInWithEmail,
  signInWithGoogle,
  signOutFromFirebase,
} from "./browser-authentication";

describe("Firebase browser authentication boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers by email and requests email verification", async () => {
    await registerWithEmail(" student@example.com ", "long-password");

    expect(mocks.configureFirebaseAuth).toHaveBeenCalled();
    expect(mocks.createUserWithEmailAndPassword).toHaveBeenCalledWith(
      mocks.auth,
      "student@example.com",
      "long-password",
    );
    expect(mocks.sendEmailVerification).toHaveBeenCalledWith(mocks.user);
  });

  it("rejects locally weak passwords before calling Firebase", async () => {
    await expect(
      registerWithEmail("student@example.com", "short"),
    ).rejects.toMatchObject({ code: "auth/weak-password" });
    expect(mocks.createUserWithEmailAndPassword).not.toHaveBeenCalled();
  });

  it("supports email sign-in and password recovery", async () => {
    await signInWithEmail(" student@example.com ", "long-password");
    await requestPasswordReset(" student@example.com ");

    expect(mocks.signInWithEmailAndPassword).toHaveBeenCalledWith(
      mocks.auth,
      "student@example.com",
      "long-password",
    );
    expect(mocks.sendPasswordResetEmail).toHaveBeenCalledWith(
      mocks.auth,
      "student@example.com",
    );
  });

  it("uses account selection for Google sign-in and explicit linking", async () => {
    await signInWithGoogle();
    await linkGoogleIdentity(mocks.user as unknown as User);

    expect(mocks.setCustomParameters).toHaveBeenCalledWith({
      prompt: "select_account",
    });
    expect(mocks.signInWithPopup).toHaveBeenCalled();
    expect(mocks.linkWithPopup).toHaveBeenCalledWith(
      mocks.user,
      expect.anything(),
    );
    expect(mocks.user.getIdToken).toHaveBeenCalledWith(true);
  });

  it("signs out through the configured Firebase instance", async () => {
    await signOutFromFirebase();
    expect(mocks.signOut).toHaveBeenCalledWith(mocks.auth);
  });
});
