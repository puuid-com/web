DROP INDEX "uq_le_puuid_queue_day";--> statement-breakpoint
ALTER TABLE "league_entries" drop column "created_day";--> statement-breakpoint
ALTER TABLE "league_entries" ADD COLUMN "created_day" date GENERATED ALWAYS AS (((created_at at time zone 'UTC')::date)) STORED;--> statement-breakpoint
CREATE UNIQUE INDEX "uq_le_puuid_queue_day" ON "league_entries" USING btree ("puuid","queue_type","created_day");