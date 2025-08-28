DROP INDEX "uq_ids_riot_id";--> statement-breakpoint
CREATE UNIQUE INDEX "uq_ids_riot_id" ON "summoner" USING btree ("riot_id");