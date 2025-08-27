ALTER TABLE "summoner" ALTER COLUMN "profile_icon_id" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_ms_match_puuid" ON "match_summoner" USING btree ("match_id","puuid");--> statement-breakpoint
CREATE INDEX "idx_match_game_time" ON "match" USING btree ("game_creation_ms","match_id");--> statement-breakpoint
CREATE INDEX "idx_match_queue_time" ON "match" USING btree ("queue_id","game_creation_ms");