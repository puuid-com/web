import type { StatsByChampionId } from "@puuid/core/server/db/schema/summoner-statistic";
import type { $GetSummonerStatisticType } from "@/server/functions/$getSummonerStatistic";
import type { ChampionMasteryDTOType } from "@puuid/core/shared/types/index";

export type MasteryWithStatistic = {
  championId: ChampionMasteryDTOType["championId"];
  mastery: ChampionMasteryDTOType;
  statistic: (StatsByChampionId[number] & { matches: number; winrate: number }) | null;
};

export const combineMasteryWithStatistic = (
  masteries: ChampionMasteryDTOType[],
  statistic: $GetSummonerStatisticType | null | undefined,
): MasteryWithStatistic[] => {
  return masteries.map((m) => {
    const _stats = statistic?.statsByChampionId.find((s) => s.championId === m.championId);

    return {
      championId: m.championId,
      mastery: m,
      statistic: _stats
        ? {
            ..._stats,
            matches: _stats.wins + _stats.losses,
            winrate: Math.round((_stats.wins / (_stats.wins + _stats.losses)) * 100),
          }
        : null,
    };
  });
};
