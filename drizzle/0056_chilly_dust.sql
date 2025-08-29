ALTER TABLE "summoner" RENAME COLUMN "user_id" TO "verified_user_id";--> statement-breakpoint
ALTER TABLE "summoner" DROP CONSTRAINT "summoner_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "summoner" ADD CONSTRAINT "summoner_verified_user_id_user_id_fk" FOREIGN KEY ("verified_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;