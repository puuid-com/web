ALTER TABLE "ids" RENAME TO "id";--> statement-breakpoint
ALTER TABLE "league_entries" RENAME TO "league_entry";--> statement-breakpoint
ALTER TABLE "riot_verification" DROP CONSTRAINT "riot_verification_puuid_ids_puuid_fk";
--> statement-breakpoint
ALTER TABLE "riot_verification" ADD CONSTRAINT "riot_verification_puuid_id_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."id"("puuid") ON DELETE no action ON UPDATE no action;