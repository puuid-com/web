import { user } from "@/server/db/auth-schema";
import type { LolRegionType } from "@/server/types/riot/common";
import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  date,
  timestamp,
  index,
  uniqueIndex,
  boolean,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { uuidv7 } from "uuidv7";

export const leagueEntryTable = pgTable(
  "league_entry",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    region: text("region").$type<LolRegionType>().notNull(),
    leagueId: text("league_id").notNull(),
    puuid: text("puuid").notNull(),

    queueType: text("queue_type").notNull(),
    tier: text("tier").notNull(),
    rank: text("rank"),

    leaguePoints: integer("league_points").notNull(),
    wins: integer("wins").notNull(),
    losses: integer("losses").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdDate: date("created_day").generatedAlwaysAs(
      () => sql`((created_at at time zone 'UTC')::date)`
    ),
  },
  (t) => [
    index("idx_le_puuid").on(t.puuid),
    uniqueIndex("uq_le_puuid_queue_day").on(
      t.puuid,
      t.queueType,
      t.createdDate
    ),
  ]
);

export const summonerTable = pgTable(
  "summoner",
  {
    puuid: text("puuid").primaryKey(),
    riotId: text("riot_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    profileIconId: integer("profile_icon_id"),
    summonerLevel: integer("summoner_level").notNull(),
    region: text("region").$type<LolRegionType>().notNull(),
    verifiedUserId: text("user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    isMain: boolean("is_main").notNull().default(false),
  },
  (t) => [uniqueIndex("uq_ids_riot_id").on(t.riotId)]
);

export type SummonerType = typeof summonerTable.$inferSelect;
export type InsertSummonerType = typeof summonerTable.$inferInsert;

export type CachedLeagueType = typeof leagueEntryTable.$inferSelect;

export const matchTable = pgTable(
  "match",
  {
    id: text("id").primaryKey(),
    queueId: integer("queue_id").notNull(),
    type: text("type").notNull(),
    gameStartAt: timestamp("game_start_at", { withTimezone: true }).notNull(),
    gameDurationSec: integer("game_duration_sec").notNull(),
    r2Key: text("r2Key").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("uq_match_id").on(t.id)]
);
export type MatchType = typeof matchTable.$inferSelect;
export const matchRelations = relations(matchTable, ({ many }) => ({
  summoners: many(summonerTable),
}));

export const matchSummoner = pgTable(
  "match_summoner",
  {
    matchId: text("match_id").notNull(),
    puuid: text("puuid").notNull(),
    teamId: integer("team_id").notNull(),
    win: boolean("win").notNull(),
    championId: integer("champion_id").notNull(),

    individualPosition: text("individual_position").notNull(),

    kills: integer("kills").notNull(),
    deaths: integer("deaths").notNull(),
    assists: integer("assists").notNull(),
    cs: integer("cs").notNull(),
    gold: integer("gold").notNull(),
    damageDealt: integer("damage_dealt").notNull(),
    damageTaken: integer("damage_taken").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.matchId, table.puuid] }),
    index("idx_match_summoner_puuid").on(table.puuid),
    index("idx_match_summoner_champion").on(table.championId),
    index("idx_match_summoner_match").on(table.matchId),
  ]
);
export type MatchSummonerType = typeof matchSummoner.$inferSelect;
