CREATE TABLE "match" (
	"match_id" text PRIMARY KEY NOT NULL,
	"game_creation_ms" bigint NOT NULL,
	"game_duration_sec" integer NOT NULL,
	"queue_id" integer NOT NULL,
	"platform_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "match_summoner" (
	"match_id" text NOT NULL,
	"puuid" text NOT NULL,
	"game_name" text,
	"tag_line" text,
	"profile_icon_id" integer,
	"individual_position" text,
	"team_id" integer NOT NULL,
	"win" boolean NOT NULL,
	"kills" integer NOT NULL,
	"deaths" integer NOT NULL,
	"assists" integer NOT NULL,
	"total_damage_dealt_to_champions" integer NOT NULL,
	"total_damage_taken" integer NOT NULL,
	"champion_id" integer NOT NULL,
	"champ_level" integer NOT NULL,
	"items" integer[] NOT NULL,
	"cs" integer NOT NULL,
	"vs_summoner_puuid" text,
	"damage_dealt_to_objectives" integer,
	"dragon_kills" integer,
	"vision_score" integer,
	"largest_critical_strike" integer,
	"solo_kills" integer,
	"ward_takedowns" integer,
	"inhibitor_kills" integer,
	"turret_kills" integer,
	"spell_ids" integer[] NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_summoner" ADD CONSTRAINT "match_summoner_match_id_match_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("match_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_fms_match" ON "match_summoner" USING btree ("match_id");--> statement-breakpoint
CREATE INDEX "idx_fms_puuid" ON "match_summoner" USING btree ("puuid");