CREATE TYPE "public"."account_status" AS ENUM('active', 'deleting');--> statement-breakpoint
CREATE TYPE "public"."connection_status" AS ENUM('active', 'revoked');--> statement-breakpoint
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'revoked', 'expired');--> statement-breakpoint
CREATE TYPE "public"."relationship_type" AS ENUM('parent', 'educator');--> statement-breakpoint
CREATE TABLE "account_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_account_id" uuid,
	"subject_account_id" uuid,
	"event_type" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" uuid,
	"metadata" jsonb NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"normalized_email" text NOT NULL,
	"display_name" text,
	"status" "account_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"account_id" uuid NOT NULL,
	"issuer" text NOT NULL,
	"subject" text NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone,
	"provider_ids" jsonb NOT NULL,
	"last_authenticated_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sharing_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_account_id" uuid NOT NULL,
	"recipient_account_id" uuid NOT NULL,
	"relationship_type" "relationship_type" NOT NULL,
	"permission_scopes" jsonb NOT NULL,
	"source_invitation_id" uuid NOT NULL,
	"status" "connection_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sharing_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_account_id" uuid NOT NULL,
	"recipient_email" text NOT NULL,
	"normalized_recipient_email" text NOT NULL,
	"relationship_type" "relationship_type" NOT NULL,
	"permission_scopes" jsonb NOT NULL,
	"token_hash" text NOT NULL,
	"status" "invitation_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_by_account_id" uuid,
	"accepted_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account_audit_events" ADD CONSTRAINT "account_audit_events_actor_account_id_accounts_id_fk" FOREIGN KEY ("actor_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account_audit_events" ADD CONSTRAINT "account_audit_events_subject_account_id_accounts_id_fk" FOREIGN KEY ("subject_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sharing_connections" ADD CONSTRAINT "sharing_connections_owner_account_id_accounts_id_fk" FOREIGN KEY ("owner_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sharing_connections" ADD CONSTRAINT "sharing_connections_recipient_account_id_accounts_id_fk" FOREIGN KEY ("recipient_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sharing_connections" ADD CONSTRAINT "sharing_connections_source_invitation_id_sharing_invitations_id_fk" FOREIGN KEY ("source_invitation_id") REFERENCES "public"."sharing_invitations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sharing_invitations" ADD CONSTRAINT "sharing_invitations_owner_account_id_accounts_id_fk" FOREIGN KEY ("owner_account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sharing_invitations" ADD CONSTRAINT "sharing_invitations_accepted_by_account_id_accounts_id_fk" FOREIGN KEY ("accepted_by_account_id") REFERENCES "public"."accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_audit_events_subject_idx" ON "account_audit_events" USING btree ("subject_account_id","occurred_at");--> statement-breakpoint
CREATE UNIQUE INDEX "accounts_normalized_email_unique" ON "accounts" USING btree ("normalized_email");--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_issuer_subject_unique" ON "auth_identities" USING btree ("issuer","subject");--> statement-breakpoint
CREATE INDEX "auth_identities_account_idx" ON "auth_identities" USING btree ("account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sharing_connections_source_invitation_unique" ON "sharing_connections" USING btree ("source_invitation_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sharing_connections_active_relationship_unique" ON "sharing_connections" USING btree ("owner_account_id","recipient_account_id","relationship_type") WHERE "sharing_connections"."status" = 'active';--> statement-breakpoint
CREATE INDEX "sharing_connections_owner_idx" ON "sharing_connections" USING btree ("owner_account_id");--> statement-breakpoint
CREATE INDEX "sharing_connections_recipient_idx" ON "sharing_connections" USING btree ("recipient_account_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sharing_invitations_token_hash_unique" ON "sharing_invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "sharing_invitations_owner_idx" ON "sharing_invitations" USING btree ("owner_account_id");--> statement-breakpoint
CREATE INDEX "sharing_invitations_recipient_idx" ON "sharing_invitations" USING btree ("normalized_recipient_email","status");