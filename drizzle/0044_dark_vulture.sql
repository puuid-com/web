ALTER TABLE "summoner_refresh" ADD COLUMN "last_game_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "summoner_refresh" DROP COLUMN "last_match_id";