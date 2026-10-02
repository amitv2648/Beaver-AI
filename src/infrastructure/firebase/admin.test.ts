import { describe, expect, it } from "vitest";
import { isFirebaseIdentityRejected } from "./admin";

describe("Firebase Admin error classification", () => {
  it.each([
    "auth/argument-error",
    "auth/id-token-expired",
    "auth/id-token-revoked",
    "auth/invalid-id-token",
    "auth/tenant-id-mismatch",
    "auth/user-disabled",
    "auth/user-not-found",
  ])("classifies %s as an identity rejection", (code) => {
    expect(isFirebaseIdentityRejected({ code })).toBe(true);
  });

  it.each([
    "app/invalid-credential",
    "auth/insufficient-permission",
    "auth/internal-error",
  ])(
    "does not classify infrastructure error %s as an identity rejection",
    (code) => {
      expect(isFirebaseIdentityRejected({ code })).toBe(false);
    },
  );

  it("does not classify an untyped infrastructure error as an identity rejection", () => {
    expect(
      isFirebaseIdentityRejected(
        new Error("Could not load the default credentials."),
      ),
    ).toBe(false);
  });
});
