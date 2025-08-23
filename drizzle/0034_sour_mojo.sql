ALTER TABLE "statistic" ALTER COLUMN "latest_league_entry_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ALTER COLUMN "main_champion_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "main_champion_color" text NOT NULL;