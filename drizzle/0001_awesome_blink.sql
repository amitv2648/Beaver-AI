ALTER TABLE "sharing_connections" ADD CONSTRAINT "sharing_connections_permission_scopes_valid" CHECK (jsonb_typeof("sharing_connections"."permission_scopes") = 'array'
        and jsonb_array_length("sharing_connections"."permission_scopes") > 0
        and "sharing_connections"."permission_scopes" <@ '["learning_time","learning_activity","academic_progress","concept_summary","improvement_areas"]'::jsonb
        and ("sharing_connections"."relationship_type" <> 'educator' or not "sharing_connections"."permission_scopes" @> '["learning_time"]'::jsonb));--> statement-breakpoint
ALTER TABLE "sharing_connections" ADD CONSTRAINT "sharing_connections_distinct_accounts" CHECK ("sharing_connections"."owner_account_id" <> "sharing_connections"."recipient_account_id");--> statement-breakpoint
ALTER TABLE "sharing_invitations" ADD CONSTRAINT "sharing_invitations_permission_scopes_valid" CHECK (jsonb_typeof("sharing_invitations"."permission_scopes") = 'array'
        and jsonb_array_length("sharing_invitations"."permission_scopes") > 0
        and "sharing_invitations"."permission_scopes" <@ '["learning_time","learning_activity","academic_progress","concept_summary","improvement_areas"]'::jsonb
        and ("sharing_invitations"."relationship_type" <> 'educator' or not "sharing_invitations"."permission_scopes" @> '["learning_time"]'::jsonb));