import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "@/server/db/schema/auth";
import * as matchSchema from "@/server/db/schema/match";
import { serverEnv } from "@/server/lib/env/server";
import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as followingSchema from "@/server/db/schema/following";
import * as leagueSchema from "@/server/db/schema/league";
import * as refreshSchema from "@/server/db/schema/refresh";
import * as summonerSchema from "@/server/db/schema/summoner";
import * as summonerStatisticSchema from "@/server/db/schema/summoner-statistic";
import * as noteSchema from "@/server/db/schema/note";

// charge le CA une seule fois
const ca = readFileSync(resolve(process.cwd(), "ca-certificate.crt"), "utf8");

const pool = new Pool({
  host: serverEnv.DATABASE_HOST,
  port: serverEnv.DATABASE_PORT,
  database: serverEnv.DATABASE_NAME,
  user: serverEnv.DATABASE_USER,
  password: serverEnv.DATABASE_PASSWORD,
  ssl: { ca }, // vérification activée
});

export const db = drizzle({
  client: pool,
  schema: {
    ...authSchema,
    ...followingSchema,
    ...leagueSchema,
    ...refreshSchema,
    ...summonerSchema,
    ...summonerStatisticSchema,
    ...noteSchema,
    ...matchSchema,
  },
  logger: false,
});

export type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];
