import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { IndividualPositionType } from "@/server/api-route/riot/match/MatchDTO";
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
  jsonb,
  doublePrecision,
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
    puuid: text("puuid")
      .references(() => summonerTable.puuid, { onDelete: "cascade" })
      .notNull(),

    queueType: text("queue_type").$type<LolQueueType>().notNull(),
    tier: text("tier").notNull(),
    rank: text("rank"),

    leaguePoints: integer("league_points").notNull(),
    wins: integer("wins").notNull(),
    losses: integer("losses").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    createdDate: date("created_day").generatedAlwaysAs(
      () => sql`((created_at at time zone 'UTC')::date)`,
    ),
  },
  (t) => [
    index("idx_le_puuid").on(t.puuid),
    uniqueIndex("uq_le_puuid_queue_day").on(t.puuid, t.queueType, t.createdDate),
  ],
);

export const leagueEntryTableRelations = relations(leagueEntryTable, ({ one }) => ({
  summoner: one(summonerTable, {
    fields: [leagueEntryTable.puuid],
    references: [summonerTable.puuid],
  }),
}));

export const summonerTable = pgTable(
  "summoner",
  {
    puuid: text("puuid").primaryKey(),

    displayRiotId: text("display_riot_id").notNull(),
    riotId: text("riot_id").notNull(),
    normalizedRiotId: text("normalized_riot_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    profileIconId: integer("profile_icon_id").notNull(),
    summonerLevel: integer("summoner_level").notNull(),
    region: text("region").$type<LolRegionType>().notNull(),
    verifiedUserId: text("user_id").references(() => user.id, {
      onDelete: "cascade",
    }),
    isMain: boolean("is_main").notNull().default(false),
  },
  (t) => [
    uniqueIndex("uq_ids_riot_id").on(t.riotId),
    index("idx_normalized_riot_id").on(t.normalizedRiotId),
  ],
);

export const summonerTableRelations = relations(summonerTable, ({ many, one }) => ({
  statistics: many(statisticTable),
  leagues: many(leagueEntryTable),
  refresh: one(summonerRefresh, {
    fields: [summonerTable.puuid],
    references: [summonerRefresh.puuid],
  }),
}));

export type SummonerType = typeof summonerTable.$inferSelect;
export type InsertSummonerType = typeof summonerTable.$inferInsert;

export const summonerRefresh = pgTable("summoner_refresh", {
  puuid: text("puuid")
    .primaryKey()
    .references(() => summonerTable.puuid, { onDelete: "cascade" })
    .notNull(),
  lastGameCreationEpochSec: integer("last_game_creation_epoch_sec"),
  refreshedAt: timestamp("refreshed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type StatItemType = {
  wins: number;
  losses: number;
  kills: number;
  assists: number;
  deaths: number;
};

export type StatsByChampionId = (StatItemType & { championId: number })[];
export type StatsByIndividualPosition = (StatItemType & {
  individualPosition: IndividualPositionType;
})[];
export type StatsByTeamId = (StatItemType & { teamId: number })[];

export const statisticTable = pgTable(
  "statistic",
  {
    puuid: text("puuid")
      .references(() => summonerTable.puuid, { onDelete: "cascade" })
      .notNull(),
    queueType: text("queue_type").$type<LolQueueType>().notNull(),

    latestLeagueEntryId: uuid("latest_league_entry_id")
      .references(() => leagueEntryTable.id, { onDelete: "set null" })
      .notNull(),
    mainIndividualPosition: text("main_individual_position").$type<IndividualPositionType | null>(),

    mainChampionId: integer("main_champion_id").notNull(),
    mainChampionBackgroundColor: text("main_champion_background_color"),
    mainChampionForegroundColor: text("main_champion_foreground_color"),

    kills: integer("kills").notNull(),
    assists: integer("assists").notNull(),
    deaths: integer("deaths").notNull(),

    averageKda: doublePrecision("average_kda").notNull(),
    averageKillPerGame: doublePrecision("average_kill_per_game").notNull(),
    averageDeathPerGame: doublePrecision("average_death_per_game").notNull(),
    averageAssistPerGame: doublePrecision("average_assist_per_game").notNull(),

    // stats
    statsByChampionId: jsonb("stats_by_champion_id").$type<StatsByChampionId>().notNull(),
    statsByIndividualPosition: jsonb("stats_by_individual_position")
      .$type<StatsByIndividualPosition>()
      .notNull(),
    statsByOppositeIndividualPositionChampionId: jsonb(
      "stats_by_opposite_individual_position_champion_id",
    )
      .$type<StatsByChampionId>()
      .notNull(),

    refreshedAt: timestamp("refreshed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.puuid, t.queueType] })],
);

export const statisticTableRelations = relations(statisticTable, ({ one }) => ({
  summoner: one(summonerTable, {
    fields: [statisticTable.puuid],
    references: [summonerTable.puuid],
  }),
  league: one(leagueEntryTable, {
    fields: [statisticTable.latestLeagueEntryId],
    references: [leagueEntryTable.id],
  }),
}));

export type StatisticRowType = typeof statisticTable.$inferSelect;
export type InsertStatisticRowType = typeof statisticTable.$inferInsert;

export type StatisticWithLeagueType = StatisticRowType & {
  league: LeagueRowType;
};

export type SummonerWithRelationsType = SummonerType & {
  statistics: StatisticWithLeagueType[];
  leagues: LeagueRowType[];
  refresh: typeof summonerRefresh.$inferSelect | null;
};

export type LeagueRowType = typeof leagueEntryTable.$inferSelect;
