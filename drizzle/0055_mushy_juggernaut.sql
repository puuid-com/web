DROP INDEX "uq_ids_riot_id";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_ids_riot_id" ON "summoner" USING btree ("riot_id");--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "riot_ids";--> statement-breakpoint