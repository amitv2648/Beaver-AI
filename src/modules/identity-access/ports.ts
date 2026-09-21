import type {
  Account,
  AuthenticatedIdentity,
  PermissionScope,
  RelationshipType,
  SharingConnection,
  SharingInvitation,
  SharingOverview,
} from "./model";

export interface CreateAccountInput {
  identity: AuthenticatedIdentity;
  normalizedEmail: string;
  now: Date;
}

export interface CreateInvitationInput {
  ownerAccountId: string;
  recipientEmail: string;
  normalizedRecipientEmail: string;
  relationshipType: RelationshipType;
  permissionScopes: PermissionScope[];
  tokenHash: string;
  expiresAt: Date;
  now: Date;
}

export interface IdentityAccessRepository {
  findAccountByIdentity(subject: string): Promise<Account | null>;
  findAccountByNormalizedEmail(email: string): Promise<Account | null>;
  createAccount(input: CreateAccountInput): Promise<Account>;
  synchronizeIdentity(
    accountId: string,
    identity: AuthenticatedIdentity,
    now: Date,
  ): Promise<Account>;
  getAccount(accountId: string): Promise<Account | null>;
  updateAccount(
    accountId: string,
    displayName: string,
    now: Date,
  ): Promise<Account>;
  markAccountDeleting(accountId: string, now: Date): Promise<void>;
  purgeAccount(accountId: string): Promise<void>;

  createInvitation(input: CreateInvitationInput): Promise<SharingInvitation>;
  getSharingOverview(accountId: string, now: Date): Promise<SharingOverview>;
  acceptInvitation(input: {
    tokenHash: string;
    recipientAccountId: string;
    recipientNormalizedEmail: string;
    now: Date;
  }): Promise<SharingConnection>;
  revokeInvitation(
    invitationId: string,
    ownerAccountId: string,
    now: Date,
  ): Promise<void>;
  revokeConnection(
    connectionId: string,
    ownerAccountId: string,
    now: Date,
  ): Promise<void>;
  hasActivePermission(
    ownerAccountId: string,
    recipientAccountId: string,
    permission: PermissionScope,
  ): Promise<boolean>;
}

export interface IdentityAdministrationGateway {
  deleteIdentity(subject: string): Promise<void>;
}

export interface Clock {
  now(): Date;
}

export interface TokenGenerator {
  generate(): string;
  hash(value: string): string;
}
