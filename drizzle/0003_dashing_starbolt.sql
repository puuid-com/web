ALTER TABLE "user" ADD COLUMN "roles" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "riot_ids";