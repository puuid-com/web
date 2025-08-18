CREATE TABLE "riot_verification" (
	"user_id" text NOT NULL,
	"puuid" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "riot_links_puuid_pk" PRIMARY KEY("puuid")
);
--> statement-breakpoint
ALTER TABLE "riot_verification" ADD CONSTRAINT "riot_verification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "riot_verification" ADD CONSTRAINT "riot_verification_puuid_ids_puuid_fk" FOREIGN KEY ("puuid") REFERENCES "public"."ids"("puuid") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "riot_links_user_idx" ON "riot_verification" USING btree ("user_id");