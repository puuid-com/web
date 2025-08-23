CREATE TABLE "statistic" (
	"puuid" text NOT NULL,
	"queue_type" text NOT NULL,
	"latest_league_entry_id" uuid,
	"main_individual_position" text,
	"main_champion_id" integer,
	"refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "statistic_puuid_queue_type_pk" PRIMARY KEY("puuid","queue_type")
);
--> statement-breakpoint
ALTER TABLE "statistic" ADD CONSTRAINT "statistic_latest_league_entry_id_league_entry_id_fk" FOREIGN KEY ("latest_league_entry_id") REFERENCES "public"."league_entry"("id") ON DELETE set null ON UPDATE no action;