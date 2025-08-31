import { serverEnv } from "@/server/lib/env/server";
import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const caPath = resolve(process.cwd(), "ca-certificate.crt");
const ca = readFileSync(caPath, "utf8");

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
