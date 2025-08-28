ALTER TABLE "summoner_refresh" ADD COLUMN "last_game_creation_epoch_sec" integer;--> statement-breakpoint
ALTER TABLE "summoner_refresh" DROP COLUMN "last_game_at";