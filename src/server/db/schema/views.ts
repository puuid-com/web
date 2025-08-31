import type { LolIndividualPositionType } from "@/server/api-route/riot/match/MatchDTO";
import { integer, text, numeric, pgMaterializedView } from "drizzle-orm/pg-core";

export const championView = pgMaterializedView("champion_main_position_stats_mv", {
  championId: integer("champion_id").notNull(),
  mainIndividualPosition: text("main_individual_position")
    .$type<LolIndividualPositionType>()
    .notNull(),
  gamesCount: integer("games_count").notNull(),
  wins: integer("wins").notNull(),
  losses: integer("losses").notNull(),
  winratePct: numeric("winrate_pct").notNull(),
  avgKda: numeric("avg_kda").notNull(),
}).existing();
export type ChampionViewType = typeof championView.$inferSelect;
