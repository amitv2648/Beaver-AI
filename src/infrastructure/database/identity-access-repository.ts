import { and, eq, inArray, lte, ne, or, sql } from "drizzle-orm";
import {
  DomainError,
  normalizeEmail,
  type Account,
  type SharingConnection,
  type SharingInvitation,
} from "@/modules/identity-access/model";
import type {
  CreateAccountInput,
  CreateInvitationInput,
  IdentityAccessRepository,
} from "@/modules/identity-access/ports";
import type { BeaverDatabase } from "./client";
import {
  accountAuditEvents,
  accounts,
  authIdentities,
  sharingConnections,
  sharingInvitations,
} from "./schema";

function toAccount(row: typeof accounts.$inferSelect): Account {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toInvitation(
  row: typeof sharingInvitations.$inferSelect,
): SharingInvitation {
  return {
    id: row.id,
    ownerAccountId: row.ownerAccountId,
    recipientEmail: row.recipientEmail,
    relationshipType: row.relationshipType,
    permissionScopes: row.permissionScopes,
    status: row.status,
    expiresAt: row.expiresAt,
    acceptedByAccountId: row.acceptedByAccountId,
    acceptedAt: row.acceptedAt,
    revokedAt: row.revokedAt,
    createdAt: row.createdAt,
  };
}

function toConnection(
  row: typeof sharingConnections.$inferSelect,
): SharingConnection {
  return {
    id: row.id,
    ownerAccountId: row.ownerAccountId,
    recipientAccountId: row.recipientAccountId,
    relationshipType: row.relationshipType,
    permissionScopes: row.permissionScopes,
    status: row.status,
    createdAt: row.createdAt,
    revokedAt: row.revokedAt,
  };
}

export class PostgresIdentityAccessRepository implements IdentityAccessRepository {
  constructor(private readonly database: BeaverDatabase) {}

  async findAccountByIdentity(subject: string): Promise<Account | null> {
    const [row] = await this.database
      .select({ account: accounts })
      .from(authIdentities)
      .innerJoin(accounts, eq(accounts.id, authIdentities.accountId))
      .where(
        and(
          eq(authIdentities.issuer, "firebase"),
          eq(authIdentities.subject, subject),
        ),
      )
      .limit(1);
    return row ? toAccount(row.account) : null;
  }

  async findAccountByNormalizedEmail(email: string): Promise<Account | null> {
    const [row] = await this.database
      .select()
      .from(accounts)
      .where(eq(accounts.normalizedEmail, email))
      .limit(1);
    return row ? toAccount(row) : null;
  }

  async createAccount(input: CreateAccountInput): Promise<Account> {
    try {
      return await this.database.transaction(async (transaction) => {
        const [account] = await transaction
          .insert(accounts)
          .values({
            email: input.identity.email,
            normalizedEmail: input.normalizedEmail,
            displayName: null,
            status: "active",
            createdAt: input.now,
            updatedAt: input.now,
          })
          .returning();

        if (!account) {
          throw new Error("Account creation did not return an account.");
        }

        await transaction.insert(authIdentities).values({
          accountId: account.id,
          issuer: input.identity.issuer,
          subject: input.identity.subject,
          email: input.identity.email,
          emailVerifiedAt: input.identity.emailVerified ? input.now : null,
          providerIds: input.identity.providerIds,
          lastAuthenticatedAt: input.identity.authenticatedAt,
          createdAt: input.now,
          updatedAt: input.now,
        });
        await transaction.insert(accountAuditEvents).values({
          actorAccountId: account.id,
          subjectAccountId: account.id,
          eventType: "account.created",
          targetType: "account",
          targetId: account.id,
          metadata: { identityIssuer: input.identity.issuer },
          occurredAt: input.now,
        });
        return toAccount(account);
      });
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      ) {
        throw new DomainError(
          "account_conflict",
          "This identity or email already belongs to a Beaver AI account.",
        );
      }
      throw error;
    }
  }

  async synchronizeIdentity(
    accountId: string,
    identity: CreateAccountInput["identity"],
    now: Date,
  ): Promise<Account> {
    const normalizedEmail = normalizeEmail(identity.email);
    const [conflict] = await this.database
      .select({ id: accounts.id })
      .from(accounts)
      .where(
        and(
          eq(accounts.normalizedEmail, normalizedEmail),
          ne(accounts.id, accountId),
        ),
      )
      .limit(1);
    if (conflict) {
      throw new DomainError(
        "account_conflict",
        "That email belongs to another Beaver AI account.",
      );
    }

    return this.database.transaction(async (transaction) => {
      await transaction
        .update(authIdentities)
        .set({
          email: identity.email,
          emailVerifiedAt: identity.emailVerified ? now : null,
          providerIds: identity.providerIds,
          lastAuthenticatedAt: identity.authenticatedAt,
          updatedAt: now,
        })
        .where(
          and(
            eq(authIdentities.issuer, identity.issuer),
            eq(authIdentities.subject, identity.subject),
          ),
        );

      const [account] = await transaction
        .update(accounts)
        .set({
          email: identity.email,
          normalizedEmail,
          updatedAt: now,
        })
        .where(eq(accounts.id, accountId))
        .returning();
      if (!account) {
        throw new DomainError("not_found", "Account not found.");
      }
      return toAccount(account);
    });
  }

  async getAccount(accountId: string): Promise<Account | null> {
    const [row] = await this.database
      .select()
      .from(accounts)
      .where(eq(accounts.id, accountId))
      .limit(1);
    return row ? toAccount(row) : null;
  }

  async updateAccount(
    accountId: string,
    displayName: string,
    now: Date,
  ): Promise<Account> {
    const [row] = await this.database
      .update(accounts)
      .set({ displayName, updatedAt: now })
      .where(and(eq(accounts.id, accountId), eq(accounts.status, "active")))
      .returning();
    if (!row) {
      throw new DomainError("not_found", "Account not found.");
    }
    await this.database.insert(accountAuditEvents).values({
      actorAccountId: accountId,
      subjectAccountId: accountId,
      eventType: "account.updated",
      targetType: "account",
      targetId: accountId,
      metadata: {},
      occurredAt: now,
    });
    return toAccount(row);
  }

  async markAccountDeleting(accountId: string, now: Date): Promise<void> {
    await this.database.transaction(async (transaction) => {
      const [account] = await transaction
        .update(accounts)
        .set({ status: "deleting", updatedAt: now })
        .where(eq(accounts.id, accountId))
        .returning({ id: accounts.id });
      if (!account) {
        throw new DomainError("not_found", "Account not found.");
      }

      await transaction
        .update(sharingConnections)
        .set({ status: "revoked", revokedAt: now, updatedAt: now })
        .where(
          and(
            or(
              eq(sharingConnections.ownerAccountId, accountId),
              eq(sharingConnections.recipientAccountId, accountId),
            ),
            eq(sharingConnections.status, "active"),
          ),
        );
      await transaction
        .update(sharingInvitations)
        .set({ status: "revoked", revokedAt: now, updatedAt: now })
        .where(
          and(
            eq(sharingInvitations.ownerAccountId, accountId),
            eq(sharingInvitations.status, "pending"),
          ),
        );
      await transaction.insert(accountAuditEvents).values({
        actorAccountId: accountId,
        subjectAccountId: accountId,
        eventType: "account.deletion_started",
        targetType: "account",
        targetId: accountId,
        metadata: {},
        occurredAt: now,
      });
    });
  }

  async purgeAccount(accountId: string): Promise<void> {
    await this.database.delete(accounts).where(eq(accounts.id, accountId));
  }

  async createInvitation(
    input: CreateInvitationInput,
  ): Promise<SharingInvitation> {
    return this.database.transaction(async (transaction) => {
      const [row] = await transaction
        .insert(sharingInvitations)
        .values({
          ownerAccountId: input.ownerAccountId,
          recipientEmail: input.recipientEmail,
          normalizedRecipientEmail: input.normalizedRecipientEmail,
          relationshipType: input.relationshipType,
          permissionScopes: input.permissionScopes,
          tokenHash: input.tokenHash,
          status: "pending",
          expiresAt: input.expiresAt,
          createdAt: input.now,
          updatedAt: input.now,
        })
        .returning();
      if (!row) {
        throw new Error("Invitation creation failed.");
      }
      await transaction.insert(accountAuditEvents).values({
        actorAccountId: input.ownerAccountId,
        subjectAccountId: input.ownerAccountId,
        eventType: "sharing.invitation_created",
        targetType: "sharing_invitation",
        targetId: row.id,
        metadata: {
          relationshipType: input.relationshipType,
          scopes: input.permissionScopes.join(","),
        },
        occurredAt: input.now,
      });
      return toInvitation(row);
    });
  }

  async getSharingOverview(accountId: string, now: Date) {
    await this.database
      .update(sharingInvitations)
      .set({ status: "expired", updatedAt: now })
      .where(
        and(
          eq(sharingInvitations.ownerAccountId, accountId),
          eq(sharingInvitations.status, "pending"),
          lte(sharingInvitations.expiresAt, now),
        ),
      );

    const invitationRows = await this.database
      .select()
      .from(sharingInvitations)
      .where(eq(sharingInvitations.ownerAccountId, accountId))
      .orderBy(sql`${sharingInvitations.createdAt} desc`);
    const ownedRows = await this.database
      .select()
      .from(sharingConnections)
      .where(eq(sharingConnections.ownerAccountId, accountId))
      .orderBy(sql`${sharingConnections.createdAt} desc`);
    const receivedRows = await this.database
      .select()
      .from(sharingConnections)
      .where(eq(sharingConnections.recipientAccountId, accountId))
      .orderBy(sql`${sharingConnections.createdAt} desc`);

    const counterpartIds = [
      ...ownedRows.map((row) => row.recipientAccountId),
      ...receivedRows.map((row) => row.ownerAccountId),
    ];
    const counterpartRows =
      counterpartIds.length === 0
        ? []
        : await this.database
            .select({
              id: accounts.id,
              email: accounts.email,
              displayName: accounts.displayName,
            })
            .from(accounts)
            .where(inArray(accounts.id, counterpartIds));
    const counterparts = new Map(counterpartRows.map((row) => [row.id, row]));
    const addCounterpart = (
      connection: typeof sharingConnections.$inferSelect,
      counterpartId: string,
    ): SharingConnection => {
      const result = toConnection(connection);
      const counterpart = counterparts.get(counterpartId);
      return {
        ...result,
        counterpartEmail: counterpart?.email,
        counterpartDisplayName: counterpart?.displayName,
      };
    };

    return {
      invitations: invitationRows.map(toInvitation),
      ownedConnections: ownedRows.map((row) =>
        addCounterpart(row, row.recipientAccountId),
      ),
      receivedConnections: receivedRows.map((row) =>
        addCounterpart(row, row.ownerAccountId),
      ),
    };
  }

  async acceptInvitation(input: {
    tokenHash: string;
    recipientAccountId: string;
    recipientNormalizedEmail: string;
    now: Date;
  }): Promise<SharingConnection> {
    return this.database.transaction(async (transaction) => {
      const [invitation] = await transaction
        .select()
        .from(sharingInvitations)
        .where(eq(sharingInvitations.tokenHash, input.tokenHash))
        .limit(1)
        .for("update");

      if (!invitation || invitation.status !== "pending") {
        throw new DomainError(
          "invitation_invalid",
          "This invitation is no longer available.",
        );
      }
      if (invitation.expiresAt <= input.now) {
        throw new DomainError(
          "invitation_expired",
          "This invitation has expired.",
        );
      }
      if (
        invitation.normalizedRecipientEmail !== input.recipientNormalizedEmail
      ) {
        throw new DomainError(
          "invitation_recipient_mismatch",
          "Sign in with the email address this invitation was sent to.",
        );
      }
      if (invitation.ownerAccountId === input.recipientAccountId) {
        throw new DomainError(
          "invitation_invalid",
          "You cannot accept your own invitation.",
        );
      }

      await transaction
        .update(sharingConnections)
        .set({
          status: "revoked",
          revokedAt: input.now,
          updatedAt: input.now,
        })
        .where(
          and(
            eq(sharingConnections.ownerAccountId, invitation.ownerAccountId),
            eq(sharingConnections.recipientAccountId, input.recipientAccountId),
            eq(
              sharingConnections.relationshipType,
              invitation.relationshipType,
            ),
            eq(sharingConnections.status, "active"),
          ),
        );

      const [connection] = await transaction
        .insert(sharingConnections)
        .values({
          ownerAccountId: invitation.ownerAccountId,
          recipientAccountId: input.recipientAccountId,
          relationshipType: invitation.relationshipType,
          permissionScopes: invitation.permissionScopes,
          sourceInvitationId: invitation.id,
          status: "active",
          createdAt: input.now,
          updatedAt: input.now,
        })
        .returning();
      if (!connection) {
        throw new Error("Connection creation failed.");
      }

      await transaction
        .update(sharingInvitations)
        .set({
          status: "accepted",
          acceptedByAccountId: input.recipientAccountId,
          acceptedAt: input.now,
          updatedAt: input.now,
        })
        .where(eq(sharingInvitations.id, invitation.id));
      await transaction.insert(accountAuditEvents).values({
        actorAccountId: input.recipientAccountId,
        subjectAccountId: invitation.ownerAccountId,
        eventType: "sharing.invitation_accepted",
        targetType: "sharing_connection",
        targetId: connection.id,
        metadata: {
          relationshipType: invitation.relationshipType,
          scopes: invitation.permissionScopes.join(","),
        },
        occurredAt: input.now,
      });
      return toConnection(connection);
    });
  }

  async revokeInvitation(
    invitationId: string,
    ownerAccountId: string,
    now: Date,
  ): Promise<void> {
    const [row] = await this.database
      .update(sharingInvitations)
      .set({ status: "revoked", revokedAt: now, updatedAt: now })
      .where(
        and(
          eq(sharingInvitations.id, invitationId),
          eq(sharingInvitations.ownerAccountId, ownerAccountId),
          eq(sharingInvitations.status, "pending"),
        ),
      )
      .returning({ id: sharingInvitations.id });
    if (!row) {
      throw new DomainError("not_found", "Pending invitation not found.");
    }
    await this.database.insert(accountAuditEvents).values({
      actorAccountId: ownerAccountId,
      subjectAccountId: ownerAccountId,
      eventType: "sharing.invitation_revoked",
      targetType: "sharing_invitation",
      targetId: invitationId,
      metadata: {},
      occurredAt: now,
    });
  }

  async revokeConnection(
    connectionId: string,
    ownerAccountId: string,
    now: Date,
  ): Promise<void> {
    const [row] = await this.database
      .update(sharingConnections)
      .set({ status: "revoked", revokedAt: now, updatedAt: now })
      .where(
        and(
          eq(sharingConnections.id, connectionId),
          eq(sharingConnections.ownerAccountId, ownerAccountId),
          eq(sharingConnections.status, "active"),
        ),
      )
      .returning({ id: sharingConnections.id });
    if (!row) {
      throw new DomainError("not_found", "Active connection not found.");
    }
    await this.database.insert(accountAuditEvents).values({
      actorAccountId: ownerAccountId,
      subjectAccountId: ownerAccountId,
      eventType: "sharing.connection_revoked",
      targetType: "sharing_connection",
      targetId: connectionId,
      metadata: {},
      occurredAt: now,
    });
  }

  async hasActivePermission(
    ownerAccountId: string,
    recipientAccountId: string,
    permission: Parameters<IdentityAccessRepository["hasActivePermission"]>[2],
  ): Promise<boolean> {
    const [row] = await this.database
      .select({ id: sharingConnections.id })
      .from(sharingConnections)
      .where(
        and(
          eq(sharingConnections.ownerAccountId, ownerAccountId),
          eq(sharingConnections.recipientAccountId, recipientAccountId),
          eq(sharingConnections.status, "active"),
          sql`${sharingConnections.permissionScopes} @> ${JSON.stringify([
            permission,
          ])}::jsonb`,
        ),
      )
      .limit(1);
    return Boolean(row);
  }
}
