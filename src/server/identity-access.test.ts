import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({
  verifyFirebaseToken: vi.fn(),
}));

vi.mock("@/infrastructure/firebase/admin", () => ({
  FirebaseIdentityAdministration: class {
    deleteIdentity = vi.fn();
  },
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
  beforeEach(() => vi.clearAllMocks());

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
});
