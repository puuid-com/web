import { serverEnv } from "@/server/lib/env/server";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";

import fs from "node:fs";
import path from "node:path";
const certPath = path.join(process.cwd(), "ca-certificate.crt");
const ca = fs.readFileSync(certPath, "utf8");

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/server/db/schema"],
  dialect: "postgresql",
  dbCredentials: {
    host: serverEnv.DATABASE_HOST,
    port: serverEnv.DATABASE_PORT,
    database: serverEnv.DATABASE_NAME,
    user: serverEnv.DATABASE_USER,
    password: serverEnv.DATABASE_PASSWORD, // mets ton mdp ici, pas dans l’URL
    ssl: { ca }, // vérification activée
  },
});
