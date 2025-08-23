ALTER TABLE "match_summoner" ALTER COLUMN "individual_position" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "kills" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "assists" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "deaths" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "average_kda" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "average_kill_per_game" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "average_death_per_game" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "average_assist_per_game" double precision NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "stats_by_champion_id" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "stats_by_individual_position" jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "statistic" ADD COLUMN "stats_by_opposite_individual_position_champion_id" jsonb NOT NULL;