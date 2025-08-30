import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "@/server/db/auth-schema";
import * as schemas from "@/server/db/schema";
import * as matchSchema from "@/server/db/match-schema";
import { serverEnv } from "@/server/lib/env/server";
import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

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
  schema: { ...authSchema, ...schemas, ...matchSchema },
  logger: false,
});

export type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];
