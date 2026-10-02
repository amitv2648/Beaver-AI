import { describe, expect, it } from "vitest";
import {
  DomainError,
  normalizeEmail,
  type Account,
  type AuthenticatedIdentity,
  type PermissionScope,
  type SharingConnection,
  type SharingInvitation,
  type SharingOverview,
} from "./model";
import type {
  Clock,
  CreateAccountInput,
  CreateInvitationInput,
  IdentityAccessRepository,
  IdentityAdministrationGateway,
  TokenGenerator,
} from "./ports";
import { IdentityAccessService } from "./service";

const NOW = new Date("2026-09-20T20:00:00.000Z");

function identity(
  subject: string,
  email: string,
  overrides: Partial<AuthenticatedIdentity> = {},
): AuthenticatedIdentity {
  return {
    issuer: "firebase",
    subject,
    email,
    emailVerified: true,
    providerIds: ["password"],
    authenticatedAt: NOW,
    ...overrides,
  };
}

class FixedClock implements Clock {
  constructor(public value = NOW) {}
  now() {
    return this.value;
  }
}

class FixedTokens implements TokenGenerator {
  generate() {
    return "raw-invitation-token";
  }
  hash(value: string) {
    return `hash:${value}`;
  }
}

class FakeIdentityAdministration implements IdentityAdministrationGateway {
  deleted: string[] = [];
  failure: Error | null = null;
  async deleteIdentity(subject: string) {
    if (this.failure) throw this.failure;
    this.deleted.push(subject);
  }
}

class MemoryRepository implements IdentityAccessRepository {
  accounts = new Map<string, Account>();
  identityAccounts = new Map<string, string>();
  invitations = new Map<string, SharingInvitation & { tokenHash: string }>();
  connections = new Map<string, SharingConnection>();
  purgeFailure: Error | null = null;
  private sequence = 0;

  async findAccountByIdentity(subject: string) {
    const id = this.identityAccounts.get(subject);
    return id ? (this.accounts.get(id) ?? null) : null;
  }

  async findAccountByNormalizedEmail(email: string) {
    return (
      [...this.accounts.values()].find(
        (account) => normalizeEmail(account.email) === email,
      ) ?? null
    );
  }

  async createAccount(input: CreateAccountInput) {
    const id = `account-${++this.sequence}`;
    const account: Account = {
      id,
      email: input.identity.email,
      displayName: null,
      status: "active",
      createdAt: input.now,
      updatedAt: input.now,
    };
    this.accounts.set(id, account);
    this.identityAccounts.set(input.identity.subject, id);
    return account;
  }

  async synchronizeIdentity(
    accountId: string,
    nextIdentity: AuthenticatedIdentity,
    now: Date,
  ) {
    const current = this.accounts.get(accountId);
    if (!current) throw new DomainError("not_found", "Account not found.");
    const updated = {
      ...current,
      email: nextIdentity.email,
      updatedAt: now,
    };
    this.accounts.set(accountId, updated);
    return updated;
  }

  async getAccount(accountId: string) {
    return this.accounts.get(accountId) ?? null;
  }

  async updateAccount(accountId: string, displayName: string, now: Date) {
    const current = this.accounts.get(accountId);
    if (!current) throw new DomainError("not_found", "Account not found.");
    const updated = { ...current, displayName, updatedAt: now };
    this.accounts.set(accountId, updated);
    return updated;
  }

  async markAccountDeleting(accountId: string, now: Date) {
    const current = this.accounts.get(accountId);
    if (!current) throw new DomainError("not_found", "Account not found.");
    this.accounts.set(accountId, {
      ...current,
      status: "deleting",
      updatedAt: now,
    });
    for (const [id, connection] of this.connections) {
      if (
        connection.ownerAccountId === accountId ||
        connection.recipientAccountId === accountId
      ) {
        this.connections.set(id, {
          ...connection,
          status: "revoked",
          revokedAt: now,
        });
      }
    }
  }

  async purgeAccount(accountId: string) {
    if (this.purgeFailure) throw this.purgeFailure;
    this.accounts.delete(accountId);
  }

  async createInvitation(input: CreateInvitationInput) {
    const id = `invitation-${++this.sequence}`;
    const invitation: SharingInvitation & { tokenHash: string } = {
      id,
      ownerAccountId: input.ownerAccountId,
      recipientEmail: input.recipientEmail,
      relationshipType: input.relationshipType,
      permissionScopes: input.permissionScopes,
      tokenHash: input.tokenHash,
      status: "pending",
      expiresAt: input.expiresAt,
      acceptedByAccountId: null,
      acceptedAt: null,
      revokedAt: null,
      createdAt: input.now,
    };
    this.invitations.set(id, invitation);
    return invitation;
  }

  async getSharingOverview(
    accountId: string,
    now: Date,
  ): Promise<SharingOverview> {
    const invitations = [...this.invitations.values()].map((invitation) => {
      if (invitation.status === "pending" && invitation.expiresAt <= now) {
        invitation.status = "expired";
      }
      return invitation;
    });
    return {
      invitations: invitations.filter(
        (invitation) => invitation.ownerAccountId === accountId,
      ),
      ownedConnections: [...this.connections.values()].filter(
        (connection) => connection.ownerAccountId === accountId,
      ),
      receivedConnections: [...this.connections.values()].filter(
        (connection) => connection.recipientAccountId === accountId,
      ),
    };
  }

  async acceptInvitation(input: {
    tokenHash: string;
    recipientAccountId: string;
    recipientNormalizedEmail: string;
    now: Date;
  }) {
    const invitation = [...this.invitations.values()].find(
      (candidate) => candidate.tokenHash === input.tokenHash,
    );
    if (!invitation || invitation.status !== "pending") {
      throw new DomainError("invitation_invalid", "Invitation unavailable.");
    }
    if (invitation.expiresAt <= input.now) {
      throw new DomainError("invitation_expired", "Invitation expired.");
    }
    if (
      normalizeEmail(invitation.recipientEmail) !==
      input.recipientNormalizedEmail
    ) {
      throw new DomainError(
        "invitation_recipient_mismatch",
        "Wrong recipient.",
      );
    }
    invitation.status = "accepted";
    invitation.acceptedByAccountId = input.recipientAccountId;
    invitation.acceptedAt = input.now;
    const connection: SharingConnection = {
      id: `connection-${++this.sequence}`,
      ownerAccountId: invitation.ownerAccountId,
      recipientAccountId: input.recipientAccountId,
      relationshipType: invitation.relationshipType,
      permissionScopes: invitation.permissionScopes,
      status: "active",
      createdAt: input.now,
      revokedAt: null,
    };
    this.connections.set(connection.id, connection);
    return connection;
  }

  async revokeInvitation(
    invitationId: string,
    ownerAccountId: string,
    now: Date,
  ) {
    const invitation = this.invitations.get(invitationId);
    if (
      !invitation ||
      invitation.ownerAccountId !== ownerAccountId ||
      invitation.status !== "pending"
    ) {
      throw new DomainError("not_found", "Invitation not found.");
    }
    invitation.status = "revoked";
    invitation.revokedAt = now;
  }

  async revokeConnection(
    connectionId: string,
    ownerAccountId: string,
    now: Date,
  ) {
    const connection = this.connections.get(connectionId);
    if (
      !connection ||
      connection.ownerAccountId !== ownerAccountId ||
      connection.status !== "active"
    ) {
      throw new DomainError("not_found", "Connection not found.");
    }
    connection.status = "revoked";
    connection.revokedAt = now;
  }

  async hasActivePermission(
    ownerAccountId: string,
    recipientAccountId: string,
    permission: PermissionScope,
  ) {
    return [...this.connections.values()].some(
      (connection) =>
        connection.ownerAccountId === ownerAccountId &&
        connection.recipientAccountId === recipientAccountId &&
        connection.status === "active" &&
        connection.permissionScopes.includes(permission),
    );
  }
}

function setup() {
  const repository = new MemoryRepository();
  const identityAdministration = new FakeIdentityAdministration();
  const clock = new FixedClock();
  const service = new IdentityAccessService(
    repository,
    identityAdministration,
    clock,
    new FixedTokens(),
  );
  return { service, repository, identityAdministration, clock };
}

describe("account lifecycle", () => {
  it("creates one Beaver account and synchronizes repeat authentication", async () => {
    const { service, repository } = setup();
    const first = await service.synchronizeAccount(
      identity("firebase-student", "student@example.com"),
    );
    const second = await service.synchronizeAccount(
      identity("firebase-student", "Student@example.com", {
        providerIds: ["password", "google.com"],
      }),
    );

    expect(second.id).toBe(first.id);
    expect(repository.accounts).toHaveLength(1);
  });

  it("prevents a second identity from silently claiming an existing email", async () => {
    const { service } = setup();
    await service.synchronizeAccount(
      identity("password-identity", "student@example.com"),
    );

    await expect(
      service.synchronizeAccount(
        identity("google-identity", "STUDENT@example.com", {
          providerIds: ["google.com"],
        }),
      ),
    ).rejects.toMatchObject({ code: "account_conflict" });
  });

  it("updates account information", async () => {
    const { service } = setup();
    const account = await service.synchronizeAccount(
      identity("student", "student@example.com"),
    );

    const updated = await service.updateOwnAccount(account.id, {
      displayName: "River",
    });

    expect(updated.displayName).toBe("River");
  });

  it("requires recent authentication, disables access, then deletes both layers", async () => {
    const { service, repository, identityAdministration, clock } = setup();
    const studentIdentity = identity("student", "student@example.com");
    const account = await service.synchronizeAccount(studentIdentity);

    clock.value = new Date(NOW.getTime() + 6 * 60 * 1000);
    await expect(
      service.deleteOwnAccount(account.id, studentIdentity),
    ).rejects.toMatchObject({ code: "recent_authentication_required" });

    const recentIdentity = {
      ...studentIdentity,
      authenticatedAt: clock.value,
    };
    await service.deleteOwnAccount(account.id, recentIdentity);

    expect(identityAdministration.deleted).toEqual(["student"]);
    expect(repository.accounts.has(account.id)).toBe(false);
  });

  it("fails closed when Firebase identity deletion is interrupted", async () => {
    const { service, repository, identityAdministration } = setup();
    const studentIdentity = identity("student", "student@example.com");
    const account = await service.synchronizeAccount(studentIdentity);
    identityAdministration.failure = new Error("Firebase unavailable.");

    await expect(
      service.deleteOwnAccount(account.id, studentIdentity),
    ).rejects.toThrow("account remains disabled");
    expect(repository.accounts.get(account.id)?.status).toBe("deleting");
    await expect(service.getOwnAccount(account.id)).rejects.toMatchObject({
      code: "account_deleting",
    });
  });

  it("fails closed when database purge is interrupted after identity deletion", async () => {
    const { service, repository, identityAdministration } = setup();
    const studentIdentity = identity("student", "student@example.com");
    const account = await service.synchronizeAccount(studentIdentity);
    repository.purgeFailure = new Error("Database unavailable.");

    await expect(
      service.deleteOwnAccount(account.id, studentIdentity),
    ).rejects.toThrow("account remains disabled");
    expect(identityAdministration.deleted).toEqual(["student"]);
    expect(repository.accounts.get(account.id)?.status).toBe("deleting");
    await expect(service.getOwnAccount(account.id)).rejects.toMatchObject({
      code: "account_deleting",
    });
  });
});

describe("private sharing and authorization", () => {
  it("requires explicit acceptance and enforces only granted scopes", async () => {
    const { service, repository } = setup();
    const ownerIdentity = identity("student", "student@example.com");
    const recipientIdentity = identity("parent", "parent@example.com");
    const strangerIdentity = identity("stranger", "stranger@example.com");
    const owner = await service.synchronizeAccount(ownerIdentity);
    const recipient = await service.synchronizeAccount(recipientIdentity);
    const stranger = await service.synchronizeAccount(strangerIdentity);

    const { invitation, token } = await service.createInvitation(owner.id, {
      recipientEmail: "parent@example.com",
      relationshipType: "parent",
      permissionScopes: ["learning_time", "academic_progress"],
    });
    expect(token).toBe("raw-invitation-token");
    expect(repository.invitations.get(invitation.id)?.tokenHash).toBe(
      "hash:raw-invitation-token",
    );

    await expect(
      service.authorizeStudentResource(recipient.id, owner.id, "learning_time"),
    ).rejects.toMatchObject({ code: "forbidden" });

    const connection = await service.acceptInvitation(
      token,
      recipient.id,
      recipientIdentity,
    );

    await expect(
      service.authorizeStudentResource(recipient.id, owner.id, "learning_time"),
    ).resolves.toBeUndefined();
    await expect(
      service.authorizeStudentResource(
        recipient.id,
        owner.id,
        "concept_summary",
      ),
    ).rejects.toMatchObject({ code: "forbidden" });
    await expect(
      service.authorizeStudentResource(stranger.id, owner.id, "learning_time"),
    ).rejects.toMatchObject({ code: "forbidden" });

    await service.revokeConnection(connection.id, owner.id);
    await expect(
      service.authorizeStudentResource(recipient.id, owner.id, "learning_time"),
    ).rejects.toMatchObject({ code: "forbidden" });
  });

  it("allows owners to access their own protected resources", async () => {
    const { service } = setup();
    const owner = await service.synchronizeAccount(
      identity("student", "student@example.com"),
    );

    await expect(
      service.authorizeStudentResource(owner.id, owner.id, "academic_progress"),
    ).resolves.toBeUndefined();
  });

  it("requires the matching verified recipient and supports invitation revocation", async () => {
    const { service } = setup();
    const owner = await service.synchronizeAccount(
      identity("student", "student@example.com"),
    );
    const recipient = await service.synchronizeAccount(
      identity("parent", "parent@example.com"),
    );
    const { invitation, token } = await service.createInvitation(owner.id, {
      recipientEmail: "parent@example.com",
      relationshipType: "parent",
      permissionScopes: ["learning_time"],
    });

    await expect(
      service.acceptInvitation(
        token,
        recipient.id,
        identity("parent", "other@example.com"),
      ),
    ).rejects.toMatchObject({ code: "invitation_recipient_mismatch" });
    await expect(
      service.acceptInvitation(
        token,
        recipient.id,
        identity("parent", "parent@example.com", { emailVerified: false }),
      ),
    ).rejects.toMatchObject({ code: "forbidden" });

    await service.revokeInvitation(invitation.id, owner.id);
    await expect(
      service.acceptInvitation(
        token,
        recipient.id,
        identity("parent", "parent@example.com"),
      ),
    ).rejects.toMatchObject({ code: "invitation_invalid" });
  });

  it("does not allow educator-only relationships to request parent learning-time scope", async () => {
    const { service } = setup();
    const owner = await service.synchronizeAccount(
      identity("student", "student@example.com"),
    );

    await expect(
      service.createInvitation(owner.id, {
        recipientEmail: "teacher@example.com",
        relationshipType: "educator",
        permissionScopes: ["learning_time"],
      }),
    ).rejects.toMatchObject({ code: "validation_error" });
  });
});
