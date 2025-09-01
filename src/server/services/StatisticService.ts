import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import { db, type TransactionType } from "@/server/db";
import type { MatchWithSummonersType } from "@/server/db/schema/match";
import { averageBy, maxItemBy } from "@/server/lib";
import { upsert } from "@/server/lib/drizzle";
import { LeagueService } from "@/server/services/league/LeagueService";
import { MatchService } from "@/server/services/match/MatchService";
import { LOL_QUEUES } from "@/server/services/match/queues.type";
import { and, eq } from "drizzle-orm";
import type { LeagueRowType } from "@/server/db/schema/league";
import type { SummonerType } from "@/server/db/schema/summoner";
import {
  statisticTable,
  type InsertStatisticRowType,
  type StatisticWithLeagueType,
} from "@/server/db/schema/summoner-statistic";
import { ServerColorsService } from "@/server/services/ServerColorsService";

export type Stat = {
  wins: number;
  losses: number;
  kills: number;
  assists: number;
  deaths: number;
};

type StatsToRefresh = Pick<
  InsertStatisticRowType,
  | "statsByChampionId"
  | "statsByIndividualPosition"
  | "statsByOppositeIndividualPositionChampionId"
  | "statsByTeammates"
  | "kills"
  | "assists"
  | "deaths"
> & {
  averageAssistPerGame: number[];
  averageDeathPerGame: number[];
  averageKda: number[];
  averageKillPerGame: number[];
  wins: number;
  losses: number;
};

const sortByMatches = (a: Stat, b: Stat) => {
  const aTotal = a.losses + a.wins;
  const bTotal = b.losses + b.wins;

  return bTotal - aTotal;
};

export class StatisticService {
  static getSummonerStatistics(puuid: SummonerType["puuid"]) {
    return db.query.statisticTable.findMany({
      where: eq(statisticTable.puuid, puuid),
      with: {
        league: true,
      },
    });
  }
  static MATCHES_COUNTED = 9999;

  static async getSummonerStatistic(
    puuid: SummonerType["puuid"],
    queueType: LolQueueType,
  ): Promise<StatisticWithLeagueType | undefined> {
    return db.query.statisticTable.findFirst({
      where: and(eq(statisticTable.puuid, puuid), eq(statisticTable.queueType, queueType)),
      with: {
        league: true,
      },
    });
  }

  static async refreshSummonerStatisticTx(
    tx: TransactionType,
    summoner: Pick<SummonerType, "region" | "puuid">,
    queueType: LolQueueType,
    cachedLeagues?: LeagueRowType[],
    cachedMatches?: MatchWithSummonersType[],
  ): Promise<{
    stats: StatisticWithLeagueType | null;
    lastMatch: MatchWithSummonersType | undefined;
  }> {
    const queue = LOL_QUEUES[queueType];

    const matches =
      cachedMatches ??
      (await MatchService.getMatchesDBByPuuidFull(summoner, {
        count: this.MATCHES_COUNTED,
        queue: queue.queueId,
        start: 0,
      }));

    if (!matches.length) {
      return {
        stats: null,
        lastMatch: undefined,
      };
    }

    const league =
      (cachedLeagues ?? (await LeagueService.cacheLeaguesTx(tx, summoner))).find(
        (l) => l.queueType === queueType,
      ) ?? null;

    const _stats: StatsToRefresh = {
      statsByChampionId: [],
      statsByIndividualPosition: [],
      statsByOppositeIndividualPositionChampionId: [],
      kills: 0,
      assists: 0,
      deaths: 0,
      averageAssistPerGame: [],
      averageDeathPerGame: [],
      averageKda: [],
      averageKillPerGame: [],
      statsByTeammates: [],
      wins: 0,
      losses: 0,
    };

    const stats = matches.reduce((acc, curr) => {
      const mainSummoner = curr.summoners.find((s) => s.puuid === summoner.puuid);
      if (!mainSummoner) return acc;

      const vs = curr.summoners.find((s) => s.puuid === mainSummoner.vsSummonerPuuid);
      if (!vs) return acc;

      const incWins = mainSummoner.win ? 1 : 0;
      const incLosses = mainSummoner.win ? 0 : 1;

      acc.kills += mainSummoner.kills;
      acc.assists += mainSummoner.assists;
      acc.deaths += mainSummoner.deaths;

      acc.wins += incWins;
      acc.losses += incLosses;

      {
        const s = acc.statsByChampionId.find((s) => s.championId === mainSummoner.championId);
        if (!s) {
          acc.statsByChampionId.push({
            championId: mainSummoner.championId,
            kills: mainSummoner.kills,
            assists: mainSummoner.assists,
            deaths: mainSummoner.deaths,
            wins: incWins,
            losses: incLosses,
          });
        } else {
          s.kills += mainSummoner.kills;
          s.assists += mainSummoner.assists;
          s.deaths += mainSummoner.deaths;
          s.wins += incWins;
          s.losses += incLosses;
        }
      }

      // statsByIndividualPosition, incrémente ou crée
      {
        const s = acc.statsByIndividualPosition.find(
          (s) => s.individualPosition === mainSummoner.individualPosition,
        );
        if (!s) {
          acc.statsByIndividualPosition.push({
            individualPosition: mainSummoner.individualPosition,
            kills: mainSummoner.kills,
            assists: mainSummoner.assists,
            deaths: mainSummoner.deaths,
            wins: incWins,
            losses: incLosses,
          });
        } else {
          s.kills += mainSummoner.kills;
          s.assists += mainSummoner.assists;
          s.deaths += mainSummoner.deaths;
          s.wins += incWins;
          s.losses += incLosses;
        }
      }

      // statsByOppositeIndividualPositionChampionId, incrémente ou crée
      {
        const s = acc.statsByOppositeIndividualPositionChampionId.find(
          (s) => s.championId === vs.championId,
        );
        if (!s) {
          acc.statsByOppositeIndividualPositionChampionId.push({
            championId: vs.championId,
            kills: mainSummoner.kills,
            assists: mainSummoner.assists,
            deaths: mainSummoner.deaths,
            wins: incWins,
            losses: incLosses,
          });
        } else {
          s.kills += mainSummoner.kills;
          s.assists += mainSummoner.assists;
          s.deaths += mainSummoner.deaths;
          s.wins += incWins;
          s.losses += incLosses;
        }
      }

      {
        curr.summoners.forEach((summoner) => {
          if (mainSummoner.teamId !== summoner.teamId || summoner.puuid === mainSummoner.puuid)
            return;

          const _s = acc.statsByTeammates.find((s) => summoner.puuid === s.puuid);

          if (!_s) {
            acc.statsByTeammates.push({
              puuid: summoner.puuid,
              wins: incWins,
              losses: incLosses,
            });
          } else {
            _s.wins += incWins;
            _s.losses += incLosses;
          }
        });
      }

      acc.averageAssistPerGame.push(mainSummoner.assists);
      acc.averageDeathPerGame.push(mainSummoner.deaths);
      acc.averageKda.push(
        (mainSummoner.kills + mainSummoner.assists) / Math.max(1, mainSummoner.deaths),
      );
      acc.averageKillPerGame.push(mainSummoner.kills);

      return acc;
    }, _stats);

    const mainChampionId = maxItemBy(
      stats.statsByChampionId,
      (item) => item.losses + item.wins,
    ).championId;

    const {
      backgroundColor: mainChampionBackgroundColor,
      foregroundColor: mainChampionForegroundColor,
    } = await ServerColorsService.getMainColorsFromChampion(mainChampionId);

    const statsToInsert: InsertStatisticRowType = {
      puuid: summoner.puuid,
      statsByChampionId: stats.statsByChampionId.sort(sortByMatches),
      statsByIndividualPosition: stats.statsByIndividualPosition.sort(sortByMatches),
      statsByOppositeIndividualPositionChampionId:
        stats.statsByOppositeIndividualPositionChampionId.sort(sortByMatches),
      kills: stats.kills,
      assists: stats.assists,
      deaths: stats.deaths,
      averageAssistPerGame: averageBy(stats.averageAssistPerGame, (item) => item),
      averageDeathPerGame: averageBy(stats.averageDeathPerGame, (item) => item),
      averageKda: averageBy(stats.averageKda, (item) => item),
      averageKillPerGame: averageBy(stats.averageKillPerGame, (item) => item),
      queueType,
      latestLeagueEntryId: league?.id ?? null,

      statsByTeammates: stats.statsByTeammates
        .sort((a, b) => {
          const aTotal = a.losses + a.wins;
          const bTotal = b.losses + b.wins;

          return bTotal - aTotal;
        })
        .filter((s) => s.wins + s.losses > 2)
        .slice(0, 5),

      mainChampionId: mainChampionId,
      mainChampionForegroundColor: mainChampionForegroundColor,
      mainChampionBackgroundColor: mainChampionBackgroundColor,

      mainIndividualPosition: maxItemBy(
        stats.statsByIndividualPosition,
        (item) => item.losses + item.wins,
      ).individualPosition,

      wins: stats.wins,
      losses: stats.losses,

      refreshedAt: new Date(),
    };

    await tx
      .insert(statisticTable)
      .values(statsToInsert)
      .onConflictDoUpdate({
        target: [statisticTable.puuid, statisticTable.queueType],
        set: upsert(statisticTable),
      })
      .returning();

    const insertedStats = await tx.query.statisticTable.findFirst({
      where: and(eq(statisticTable.puuid, summoner.puuid), eq(statisticTable.queueType, queueType)),
      with: {
        league: true,
      },
    });

    if (!insertedStats) {
      throw new Error("Failed to refresh statistic");
    }

    return {
      stats: insertedStats,
      lastMatch: matches.at(0),
    };
  }

  static async changeMainChampionColors(
    puuid: SummonerType["puuid"],
    queueType: LolQueueType,
    skinId: number,
  ) {
    const stats = await db.query.statisticTable.findFirst({
      where: and(eq(statisticTable.puuid, puuid), eq(statisticTable.queueType, queueType)),
    });

    if (!stats) {
      throw new Error("No statistic found");
    }

    let mainChampionBackgroundColor: string | undefined;
    let mainChampionForegroundColor: string | undefined;

    try {
      const { backgroundColor, foregroundColor } =
        await ServerColorsService.getMainColorsFromChampionSkin(stats.mainChampionId, skinId);

      mainChampionBackgroundColor = backgroundColor;
      mainChampionForegroundColor = foregroundColor;
    } catch (e) {
      console.error(e);

      throw new Error("Failed to get colors");
    }

    return db
      .update(statisticTable)
      .set({
        mainChampionBackgroundColor,
        mainChampionForegroundColor,
        mainChampionSkinId: skinId,
      })
      .where(and(eq(statisticTable.puuid, puuid), eq(statisticTable.queueType, queueType)))
      .returning();
  }
}
