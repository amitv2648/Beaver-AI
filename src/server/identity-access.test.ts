import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  isFirebaseIdentityRejected: vi.fn(),
  verifyFirebaseToken: vi.fn(),
}));

vi.mock("@/infrastructure/firebase/admin", () => ({
  FirebaseIdentityAdministration: class {
    deleteIdentity = vi.fn();
  },
  isFirebaseIdentityRejected: mocks.isFirebaseIdentityRejected,
  verifyFirebaseToken: mocks.verifyFirebaseToken,
}));

vi.mock("@/infrastructure/database/client", () => ({
  getDatabase: vi.fn(() => ({})),
}));

vi.mock("@/infrastructure/database/identity-access-repository", () => ({
  PostgresIdentityAccessRepository: class {},
}));

import { authenticateRequest } from "./identity-access";

describe("protected request authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isFirebaseIdentityRejected.mockReturnValue(true);
  });

  it("rejects requests without a bearer token", async () => {
    const request = new NextRequest("http://localhost/api/account");

    await expect(authenticateRequest(request)).rejects.toMatchObject({
      status: 401,
      code: "authentication_required",
    });
    expect(mocks.verifyFirebaseToken).not.toHaveBeenCalled();
  });

  it("rejects invalid or revoked Firebase sessions safely", async () => {
    mocks.verifyFirebaseToken.mockRejectedValueOnce(
      new Error("provider detail must not leak"),
    );
    const request = new NextRequest("http://localhost/api/account", {
      headers: { Authorization: "Bearer invalid-token" },
    });

    await expect(authenticateRequest(request)).rejects.toMatchObject({
      status: 401,
      code: "invalid_authentication",
      message: "Your session is invalid or expired. Sign in again.",
    });
  });

  it("does not misreport Firebase infrastructure failures as invalid sessions", async () => {
    const infrastructureError = new Error(
      "Firebase Admin credentials are unavailable.",
    );
    mocks.verifyFirebaseToken.mockRejectedValueOnce(infrastructureError);
    mocks.isFirebaseIdentityRejected.mockReturnValueOnce(false);
    const request = new NextRequest("http://localhost/api/account", {
      headers: { Authorization: "Bearer valid-token" },
    });

    await expect(authenticateRequest(request)).rejects.toBe(
      infrastructureError,
    );
  });
});
