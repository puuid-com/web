ALTER TABLE "user" ADD COLUMN "riot_ids" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "roles";