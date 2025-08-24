ALTER TABLE "match_summoner" ALTER COLUMN "game_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "tag_line" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "profile_icon_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "damage_dealt_to_objectives" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "dragon_kills" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "vision_score" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "largest_critical_strike" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "solo_kills" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "ward_takedowns" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "inhibitor_kills" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "match_summoner" ALTER COLUMN "turret_kills" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_ms_puuid_matchid" ON "match_summoner" USING btree ("puuid","match_id");