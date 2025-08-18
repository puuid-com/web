import { drizzle } from "drizzle-orm/node-postgres";
import * as authSchema from "@/server/db/auth-schema";
import * as schemas from "@/server/db/schema";
import { serverEnv } from "@/lib/env/server";

export const db = drizzle(serverEnv.DATABASE_URL, {
  schema: {
    ...authSchema,
    ...schemas,
  },
});
