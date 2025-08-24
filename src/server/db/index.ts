import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "@/server/db/auth-schema";
import * as schemas from "@/server/db/schema";
import * as matchSchema from "@/server/db/match-schema";
import { serverEnv } from "@/server/lib/env/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: serverEnv.DATABASE_URL,
});
export const db = drizzle({
  client: pool,
  schema: { ...authSchema, ...schemas, ...matchSchema },
  logger: false,
});

export type TransactionType = Parameters<Parameters<typeof db.transaction>[0]>[0];
