import { summonerTable } from "@/server/db/schema/summoner";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const summonerRefresh = pgTable("summoner_refresh", {
  puuid: text("puuid")
    .primaryKey()
    .references(() => summonerTable.puuid, { onDelete: "cascade" })
    .notNull(),
  lastGameCreationEpochSec: integer("last_game_creation_epoch_sec"),
  refreshedAt: timestamp("refreshed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SummonerRefreshType = typeof summonerRefresh.$inferSelect;
export type InsertSummonerRefreshType = typeof summonerRefresh.$inferInsert;
