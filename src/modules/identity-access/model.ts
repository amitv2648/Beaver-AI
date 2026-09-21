import { z } from "zod";

export const relationshipTypes = ["parent", "educator"] as const;
export type RelationshipType = (typeof relationshipTypes)[number];

export const permissionScopes = [
  "learning_time",
  "learning_activity",
  "academic_progress",
  "concept_summary",
  "improvement_areas",
] as const;
export type PermissionScope = (typeof permissionScopes)[number];

export const permissionLabels: Record<PermissionScope, string> = {
  learning_time: "Learning time",
  learning_activity: "Learning and practice activity",
  academic_progress: "Academic progress",
  concept_summary: "Concepts learned",
  improvement_areas: "General areas needing improvement",
};

export const permissionsByRelationship: Record<
  RelationshipType,
  readonly PermissionScope[]
> = {
  parent: permissionScopes,
  educator: [
    "learning_activity",
    "academic_progress",
    "concept_summary",
    "improvement_areas",
  ],
};

export const relationshipTypeSchema = z.enum(relationshipTypes);
export const permissionScopeSchema = z.enum(permissionScopes);

export const createInvitationSchema = z
  .object({
    recipientEmail: z.string().trim().email().max(320),
    relationshipType: relationshipTypeSchema,
    permissionScopes: z
      .array(permissionScopeSchema)
      .min(1)
      .max(permissionScopes.length),
  })
  .superRefine((value, context) => {
    const allowed = new Set(permissionsByRelationship[value.relationshipType]);
    for (const scope of value.permissionScopes) {
      if (!allowed.has(scope)) {
        context.addIssue({
          code: "custom",
          path: ["permissionScopes"],
          message: `${scope} is not available for this relationship.`,
        });
      }
    }
  });

export const updateAccountSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
});

export type AccountStatus = "active" | "deleting";

export interface Account {
  id: string;
  email: string;
  displayName: string | null;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthenticatedIdentity {
  issuer: "firebase";
  subject: string;
  email: string;
  emailVerified: boolean;
  providerIds: string[];
  authenticatedAt: Date;
}

export interface SharingInvitation {
  id: string;
  ownerAccountId: string;
  recipientEmail: string;
  relationshipType: RelationshipType;
  permissionScopes: PermissionScope[];
  status: "pending" | "accepted" | "revoked" | "expired";
  expiresAt: Date;
  acceptedByAccountId: string | null;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface SharingConnection {
  id: string;
  ownerAccountId: string;
  recipientAccountId: string;
  relationshipType: RelationshipType;
  permissionScopes: PermissionScope[];
  status: "active" | "revoked";
  createdAt: Date;
  revokedAt: Date | null;
  counterpartEmail?: string;
  counterpartDisplayName?: string | null;
}

export interface SharingOverview {
  invitations: SharingInvitation[];
  ownedConnections: SharingConnection[];
  receivedConnections: SharingConnection[];
}

export type DomainErrorCode =
  | "account_conflict"
  | "account_deleting"
  | "forbidden"
  | "identity_email_required"
  | "invitation_expired"
  | "invitation_invalid"
  | "invitation_recipient_mismatch"
  | "not_found"
  | "recent_authentication_required"
  | "validation_error";

export class DomainError extends Error {
  constructor(
    public readonly code: DomainErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase("en-US");
}
