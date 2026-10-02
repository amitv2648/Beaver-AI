import { sql } from "drizzle-orm";
import {
  check,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  PermissionScope,
  RelationshipType,
} from "../../modules/identity-access/model";

export const accountStatus = pgEnum("account_status", ["active", "deleting"]);
export const invitationStatus = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);
export const connectionStatus = pgEnum("connection_status", [
  "active",
  "revoked",
]);
export const relationshipType = pgEnum("relationship_type", [
  "parent",
  "educator",
]);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    normalizedEmail: text("normalized_email").notNull(),
    displayName: text("display_name"),
    status: accountStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("accounts_normalized_email_unique").on(table.normalizedEmail),
  ],
);

export const authIdentities = pgTable(
  "auth_identities",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    issuer: text("issuer").notNull(),
    subject: text("subject").notNull(),
    email: text("email").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    providerIds: jsonb("provider_ids").$type<string[]>().notNull(),
    lastAuthenticatedAt: timestamp("last_authenticated_at", {
      withTimezone: true,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("auth_identities_issuer_subject_unique").on(
      table.issuer,
      table.subject,
    ),
    index("auth_identities_account_idx").on(table.accountId),
  ],
);

export const sharingInvitations = pgTable(
  "sharing_invitations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerAccountId: uuid("owner_account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    recipientEmail: text("recipient_email").notNull(),
    normalizedRecipientEmail: text("normalized_recipient_email").notNull(),
    relationshipType: relationshipType("relationship_type")
      .$type<RelationshipType>()
      .notNull(),
    permissionScopes: jsonb("permission_scopes")
      .$type<PermissionScope[]>()
      .notNull(),
    tokenHash: text("token_hash").notNull(),
    status: invitationStatus("status").notNull().default("pending"),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedByAccountId: uuid("accepted_by_account_id").references(
      () => accounts.id,
      { onDelete: "set null" },
    ),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("sharing_invitations_token_hash_unique").on(table.tokenHash),
    check(
      "sharing_invitations_permission_scopes_valid",
      sql`jsonb_typeof(${table.permissionScopes}) = 'array'
        and jsonb_array_length(${table.permissionScopes}) > 0
        and ${table.permissionScopes} <@ '["learning_time","learning_activity","academic_progress","concept_summary","improvement_areas"]'::jsonb
        and (${table.relationshipType} <> 'educator' or not ${table.permissionScopes} @> '["learning_time"]'::jsonb)`,
    ),
    index("sharing_invitations_owner_idx").on(table.ownerAccountId),
    index("sharing_invitations_recipient_idx").on(
      table.normalizedRecipientEmail,
      table.status,
    ),
  ],
);

export const sharingConnections = pgTable(
  "sharing_connections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerAccountId: uuid("owner_account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    recipientAccountId: uuid("recipient_account_id")
      .notNull()
      .references(() => accounts.id, { onDelete: "cascade" }),
    relationshipType: relationshipType("relationship_type")
      .$type<RelationshipType>()
      .notNull(),
    permissionScopes: jsonb("permission_scopes")
      .$type<PermissionScope[]>()
      .notNull(),
    sourceInvitationId: uuid("source_invitation_id")
      .notNull()
      .references(() => sharingInvitations.id),
    status: connectionStatus("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    uniqueIndex("sharing_connections_source_invitation_unique").on(
      table.sourceInvitationId,
    ),
    check(
      "sharing_connections_permission_scopes_valid",
      sql`jsonb_typeof(${table.permissionScopes}) = 'array'
        and jsonb_array_length(${table.permissionScopes}) > 0
        and ${table.permissionScopes} <@ '["learning_time","learning_activity","academic_progress","concept_summary","improvement_areas"]'::jsonb
        and (${table.relationshipType} <> 'educator' or not ${table.permissionScopes} @> '["learning_time"]'::jsonb)`,
    ),
    check(
      "sharing_connections_distinct_accounts",
      sql`${table.ownerAccountId} <> ${table.recipientAccountId}`,
    ),
    uniqueIndex("sharing_connections_active_relationship_unique")
      .on(
        table.ownerAccountId,
        table.recipientAccountId,
        table.relationshipType,
      )
      .where(sql`${table.status} = 'active'`),
    index("sharing_connections_owner_idx").on(table.ownerAccountId),
    index("sharing_connections_recipient_idx").on(table.recipientAccountId),
  ],
);

export const accountAuditEvents = pgTable(
  "account_audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorAccountId: uuid("actor_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    subjectAccountId: uuid("subject_account_id").references(() => accounts.id, {
      onDelete: "set null",
    }),
    eventType: text("event_type").notNull(),
    targetType: text("target_type").notNull(),
    targetId: uuid("target_id"),
    metadata: jsonb("metadata").$type<Record<string, string>>().notNull(),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  },
  (table) => [
    index("account_audit_events_subject_idx").on(
      table.subjectAccountId,
      table.occurredAt,
    ),
  ],
);
