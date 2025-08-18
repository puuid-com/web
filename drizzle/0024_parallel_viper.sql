CREATE TABLE "match_summoner" (
	"match_id" text NOT NULL,
	"puuid" text NOT NULL,
	"team_id" smallint NOT NULL,
	"win" boolean NOT NULL,
	"champion_id" integer NOT NULL,
	"role" text,
	"lane" text,
	"kills" integer NOT NULL,
	"deaths" integer NOT NULL,
	"assists" integer NOT NULL,
	"cs" integer NOT NULL,
	"gold" integer NOT NULL,
	"damage_dealt" integer NOT NULL,
	"damage_taken" integer NOT NULL,
	CONSTRAINT "match_summoner_match_id_puuid_pk" PRIMARY KEY("match_id","puuid")
);
--> statement-breakpoint
CREATE TABLE "match" (
	"id" text PRIMARY KEY NOT NULL,
	"queue_id" integer NOT NULL,
	"type" text NOT NULL,
	"game_start_at" timestamp with time zone NOT NULL,
	"game_duration_sec" integer NOT NULL,
	"r2Key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "match_summoner" ADD CONSTRAINT "match_summoner_match_id_match_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."match"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "match_summoner" ADD CONSTRAINT "match_summoner_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_match_summoner_puuid" ON "match_summoner" USING btree ("puuid");--> statement-breakpoint
CREATE INDEX "idx_match_summoner_champion" ON "match_summoner" USING btree ("champion_id");--> statement-breakpoint
CREATE INDEX "idx_match_summoner_match" ON "match_summoner" USING btree ("match_id");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_match_id" ON "match" USING btree ("id");