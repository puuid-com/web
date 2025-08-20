import type { QueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { CachedLeagueType } from "@/server/db/schema";

export type LeagueHistoryType = {
  lastest: CachedLeagueType;
  history: CachedLeagueType[];
};
export type LeaguesType = Record<QueueType, LeagueHistoryType>;
