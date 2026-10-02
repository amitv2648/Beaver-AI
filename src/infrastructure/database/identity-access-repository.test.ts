import { describe, expect, it, vi } from "vitest";
import type { CreateAccountInput } from "@/modules/identity-access/ports";
import type { BeaverDatabase } from "./client";
import { PostgresIdentityAccessRepository } from "./identity-access-repository";

const input: CreateAccountInput = {
  identity: {
    issuer: "firebase",
    subject: "firebase-subject",
    email: "student@example.com",
    emailVerified: true,
    providerIds: ["password"],
    authenticatedAt: new Date("2026-10-01T18:00:00.000Z"),
  },
  normalizedEmail: "student@example.com",
  now: new Date("2026-10-01T18:00:00.000Z"),
};

describe("PostgreSQL account creation errors", () => {
  it("maps a concurrent unique-constraint race to an account conflict", async () => {
    const database = {
      transaction: vi.fn().mockRejectedValue({ code: "23505" }),
    } as unknown as BeaverDatabase;
    const repository = new PostgresIdentityAccessRepository(database);

    await expect(repository.createAccount(input)).rejects.toMatchObject({
      code: "account_conflict",
    });
  });

  it("preserves non-constraint database failures", async () => {
    const databaseError = new Error("Database unavailable.");
    const database = {
      transaction: vi.fn().mockRejectedValue(databaseError),
    } as unknown as BeaverDatabase;
    const repository = new PostgresIdentityAccessRepository(database);

    await expect(repository.createAccount(input)).rejects.toBe(databaseError);
  });
});
