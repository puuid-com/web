ALTER TABLE "summoners" RENAME TO "ids";--> statement-breakpoint
DROP INDEX "uq_summoners_riot_id";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_ids_riot_id" ON "ids" USING btree ("riot_id");