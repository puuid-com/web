ALTER TABLE "summoner" RENAME COLUMN "verified_user_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "summoner" DROP CONSTRAINT "summoner_verified_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "summoner" ADD CONSTRAINT "summoner_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;