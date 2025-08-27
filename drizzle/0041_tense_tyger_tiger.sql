CREATE TABLE "summoner_refresh" (
	"id" uuid PRIMARY KEY NOT NULL,
	"puuid" text NOT NULL,
	"last_match_id" text NOT NULL,
	"refreshed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "summoner_refresh" ADD CONSTRAINT "summoner_refresh_puuid_summoner_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."summoner"("puuid") ON DELETE cascade ON UPDATE no action;