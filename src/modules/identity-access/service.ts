import { createHash, randomBytes } from "node:crypto";
import {
  createInvitationSchema,
  DomainError,
  normalizeEmail,
  type Account,
  type AuthenticatedIdentity,
  type PermissionScope,
  type SharingConnection,
  type SharingOverview,
  updateAccountSchema,
} from "./model";
import type {
  Clock,
  IdentityAccessRepository,
  IdentityAdministrationGateway,
  TokenGenerator,
} from "./ports";

const INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const RECENT_AUTHENTICATION_MS = 5 * 60 * 1000;

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class SecureTokenGenerator implements TokenGenerator {
  generate(): string {
    return randomBytes(32).toString("base64url");
  }

  hash(value: string): string {
    return createHash("sha256").update(value, "utf8").digest("hex");
  }
}

export class IdentityAccessService {
  constructor(
    private readonly repository: IdentityAccessRepository,
    private readonly identityAdministration: IdentityAdministrationGateway,
    private readonly clock: Clock = new SystemClock(),
    private readonly tokens: TokenGenerator = new SecureTokenGenerator(),
  ) {}

  async synchronizeAccount(identity: AuthenticatedIdentity): Promise<Account> {
    if (!identity.email) {
      throw new DomainError(
        "identity_email_required",
        "An email address is required for a Beaver AI account.",
      );
    }

    const now = this.clock.now();
    const byIdentity = await this.repository.findAccountByIdentity(
      identity.subject,
    );

    if (byIdentity) {
      this.ensureActive(byIdentity);
      return this.repository.synchronizeIdentity(byIdentity.id, identity, now);
    }

    const normalizedEmail = normalizeEmail(identity.email);
    const byEmail =
      await this.repository.findAccountByNormalizedEmail(normalizedEmail);

    if (byEmail) {
      throw new DomainError(
        "account_conflict",
        "This email belongs to an existing Beaver AI account. Sign in with the existing method, then link Google from account settings.",
      );
    }

    return this.repository.createAccount({
      identity,
      normalizedEmail,
      now,
    });
  }

  async getOwnAccount(accountId: string): Promise<Account> {
    const account = await this.repository.getAccount(accountId);
    if (!account) {
      throw new DomainError("not_found", "Account not found.");
    }
    this.ensureActive(account);
    return account;
  }

  async updateOwnAccount(accountId: string, input: unknown): Promise<Account> {
    const parsed = updateAccountSchema.safeParse(input);
    if (!parsed.success) {
      throw new DomainError("validation_error", "Enter a valid display name.");
    }
    await this.getOwnAccount(accountId);
    return this.repository.updateAccount(
      accountId,
      parsed.data.displayName,
      this.clock.now(),
    );
  }

  async deleteOwnAccount(
    accountId: string,
    identity: AuthenticatedIdentity,
  ): Promise<void> {
    const now = this.clock.now();
    if (
      now.getTime() - identity.authenticatedAt.getTime() >
      RECENT_AUTHENTICATION_MS
    ) {
      throw new DomainError(
        "recent_authentication_required",
        "Sign in again before deleting your account.",
      );
    }

    await this.getOwnAccount(accountId);
    await this.repository.markAccountDeleting(accountId, now);

    try {
      await this.identityAdministration.deleteIdentity(identity.subject);
      await this.repository.purgeAccount(accountId);
    } catch (error) {
      throw new Error(
        "Account deletion could not be completed. The account remains disabled for safe retry.",
        { cause: error },
      );
    }
  }

  async createInvitation(
    ownerAccountId: string,
    input: unknown,
  ): Promise<{
    invitation: Awaited<
      ReturnType<IdentityAccessRepository["createInvitation"]>
    >;
    token: string;
  }> {
    const parsed = createInvitationSchema.safeParse(input);
    if (!parsed.success) {
      throw new DomainError(
        "validation_error",
        parsed.error.issues[0]?.message ?? "Invalid invitation.",
      );
    }

    const owner = await this.getOwnAccount(ownerAccountId);
    const normalizedRecipientEmail = normalizeEmail(parsed.data.recipientEmail);
    if (normalizedRecipientEmail === normalizeEmail(owner.email)) {
      throw new DomainError(
        "validation_error",
        "Invite someone with a different email address.",
      );
    }

    const token = this.tokens.generate();
    const now = this.clock.now();
    const invitation = await this.repository.createInvitation({
      ownerAccountId,
      recipientEmail: parsed.data.recipientEmail,
      normalizedRecipientEmail,
      relationshipType: parsed.data.relationshipType,
      permissionScopes: [...new Set(parsed.data.permissionScopes)],
      tokenHash: this.tokens.hash(token),
      expiresAt: new Date(now.getTime() + INVITATION_LIFETIME_MS),
      now,
    });

    return { invitation, token };
  }

  async getSharingOverview(accountId: string): Promise<SharingOverview> {
    await this.getOwnAccount(accountId);
    return this.repository.getSharingOverview(accountId, this.clock.now());
  }

  async acceptInvitation(
    token: string,
    recipientAccountId: string,
    identity: AuthenticatedIdentity,
  ): Promise<SharingConnection> {
    if (!token || token.length > 256) {
      throw new DomainError("invitation_invalid", "Invitation is invalid.");
    }
    if (!identity.emailVerified) {
      throw new DomainError(
        "forbidden",
        "Verify the invited email address before accepting this invitation.",
      );
    }

    await this.getOwnAccount(recipientAccountId);
    return this.repository.acceptInvitation({
      tokenHash: this.tokens.hash(token),
      recipientAccountId,
      recipientNormalizedEmail: normalizeEmail(identity.email),
      now: this.clock.now(),
    });
  }

  async revokeInvitation(
    invitationId: string,
    ownerAccountId: string,
  ): Promise<void> {
    await this.getOwnAccount(ownerAccountId);
    await this.repository.revokeInvitation(
      invitationId,
      ownerAccountId,
      this.clock.now(),
    );
  }

  async revokeConnection(
    connectionId: string,
    ownerAccountId: string,
  ): Promise<void> {
    await this.getOwnAccount(ownerAccountId);
    await this.repository.revokeConnection(
      connectionId,
      ownerAccountId,
      this.clock.now(),
    );
  }

  async authorizeStudentResource(
    actorAccountId: string,
    ownerAccountId: string,
    requiredPermission: PermissionScope,
  ): Promise<void> {
    if (actorAccountId === ownerAccountId) {
      return;
    }

    const allowed = await this.repository.hasActivePermission(
      ownerAccountId,
      actorAccountId,
      requiredPermission,
    );
    if (!allowed) {
      throw new DomainError(
        "forbidden",
        "You do not have permission to access this resource.",
      );
    }
  }

  private ensureActive(account: Account): void {
    if (account.status !== "active") {
      throw new DomainError(
        "account_deleting",
        "This account is being deleted.",
      );
    }
  }
}
