CREATE TABLE "league_entries" (
	"id" uuid PRIMARY KEY NOT NULL,
	"platform" text NOT NULL,
	"league_id" text NOT NULL,
	"puuid" text NOT NULL,
	"queue_type" text NOT NULL,
	"tier" text NOT NULL,
	"rank" text,
	"league_points" integer NOT NULL,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "summoners" (
	"puuid" text PRIMARY KEY NOT NULL,
	"riot_id" text NOT NULL,
	"game_name" text NOT NULL,
	"tag_line" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"profile_icon_id" integer,
	"revision_date" timestamp with time zone,
	"summoner_level" integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX "idx_le_puuid" ON "league_entries" USING btree ("puuid");--> statement-breakpoint
CREATE UNIQUE INDEX "uq_summoners_riot_id" ON "summoners" USING btree ("riot_id");