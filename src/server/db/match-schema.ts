import {
  pgTable,
  text,
  integer,
  boolean,
  bigint,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const matchTable = pgTable("match", {
  matchId: text("match_id").primaryKey(),
  gameCreationMs: bigint("game_creation_ms", { mode: "number" }).notNull(),
  gameDurationSec: integer("game_duration_sec").notNull(),
  queueId: integer("queue_id").notNull(),
  platformId: text("platform_id").notNull(),
});

export const matchSummonerTable = pgTable(
  "match_summoner",
  {
    matchId: text("match_id")
      .notNull()
      .references(() => matchTable.matchId, { onDelete: "cascade" }),
    puuid: text("puuid").notNull(),
    gameName: text("game_name"),
    tagLine: text("tag_line"),
    profileIconId: integer("profile_icon_id"),

    individualPosition: text("individual_position"),
    teamId: integer("team_id").notNull(),
    win: boolean("win").notNull(),

    kills: integer("kills").notNull(),
    deaths: integer("deaths").notNull(),
    assists: integer("assists").notNull(),

    totalDamageDealtToChampions: integer(
      "total_damage_dealt_to_champions"
    ).notNull(),
    totalDamageTaken: integer("total_damage_taken").notNull(),

    championId: integer("champion_id").notNull(),
    champLevel: integer("champ_level").notNull(),

    items: integer("items").array().notNull(),
    cs: integer("cs").notNull(),

    vsSummonerPuuid: text("vs_summoner_puuid"),

    damageDealtToObjectives: integer("damage_dealt_to_objectives"),
    dragonKills: integer("dragon_kills"),
    visionScore: integer("vision_score"),
    largestCriticalStrike: integer("largest_critical_strike"),
    soloKills: integer("solo_kills"),
    wardTakedowns: integer("ward_takedowns"),
    inhibitorKills: integer("inhibitor_kills"),
    turretKills: integer("turret_kills"),

    spellIds: integer("spell_ids").array().notNull(),
  },
  (t) => [
    index("idx_fms_match").on(t.matchId),
    index("idx_fms_puuid").on(t.puuid),
  ]
);

export const matchRelations = relations(matchTable, ({ many }) => ({
  summoners: many(matchSummonerTable),
}));

export const matchSummonerRelations = relations(
  matchSummonerTable,
  ({ one }) => ({
    match: one(matchTable, {
      fields: [matchSummonerTable.matchId],
      references: [matchTable.matchId],
    }),
  })
);

export type MatchRowType = typeof matchTable.$inferSelect;
export type MatchInsertType = typeof matchTable.$inferInsert;
export type MatchSummonerRowType = typeof matchSummonerTable.$inferSelect;
export type MatchSummonerInsertType = typeof matchSummonerTable.$inferInsert;
