ALTER TABLE "id" RENAME TO "summoner";--> statement-breakpoint
ALTER TABLE "summoner" DROP CONSTRAINT "id_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "summoner" ADD CONSTRAINT "summoner_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;