import { DDragonService } from "@/client/services/DDragon";
import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import { db, type TransactionType } from "@/server/db";
import type { MatchWithSummonersType } from "@/server/db/match-schema";
import {
  statisticTable,
  summonerTable,
  type InsertStatisticRowType,
  type LeagueRowType,
  type SummonerType,
} from "@/server/db/schema";
import { averageBy, maxItemBy } from "@/server/lib";
import { upsert } from "@/server/lib/drizzle";
import { LeagueService } from "@/server/services/league";
import { MatchService } from "@/server/services/match";
import { LOL_QUEUES } from "@/server/services/match/queues.type";
import { and, eq } from "drizzle-orm";
import { Vibrant } from "node-vibrant/node";

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
  | "kills"
  | "assists"
  | "deaths"
> & {
  averageAssistPerGame: number[];
  averageDeathPerGame: number[];
  averageKda: number[];
  averageKillPerGame: number[];
};

const sortByMatches = (a: Stat, b: Stat) => {
  const aTotal = a.losses + a.wins;
  const bTotal = b.losses + b.wins;

  return bTotal - aTotal;
};

export class StatisticService {
  static MATCHES_COUNTED = 9999;

  static async getSummonerStatistic(puuid: SummonerType["puuid"], queueType: LolQueueType) {
    return db.query.statisticTable.findFirst({
      where: and(eq(statisticTable.puuid, puuid), eq(statisticTable.queueType, queueType)),
    });
  }

  static async refreshSummonerStatisticTx(
    tx: TransactionType,
    summoner: Pick<SummonerType, "region" | "puuid">,
    queueType: LolQueueType,
    cachedLeagues?: LeagueRowType[],
    cachedMatches?: MatchWithSummonersType[],
  ): Promise<void> {
    const queue = LOL_QUEUES[queueType];

    const league =
      (cachedLeagues ?? (await LeagueService.cacheLeaguesTx(tx, summoner))).find(
        (l) => l.queueType === queueType,
      ) ?? null;

    if (!league) {
      throw new Error("League not found");
    }

    const matches =
      cachedMatches ??
      (await MatchService.getMatchesDBByPuuidFull(summoner, {
        count: this.MATCHES_COUNTED,
        queue: queue.queueId,
        start: 0,
      }));

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

      // statsByChampionId, incrémente ou crée
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

    const version = await DDragonService.getLatestVersion();
    const champions = await DDragonService.getChampionsData(version);

    const mainChampionSplashImageUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champions[mainChampionId]!.id}_0.jpg`;

    const test = await Vibrant.from(mainChampionSplashImageUrl).getPalette();

    let mainChampionForegroundColor: string | undefined;
    let mainChampionBackgroundColor: string | undefined;

    if (test.Vibrant) {
      mainChampionForegroundColor = test.Vibrant.bodyTextColor;
      mainChampionBackgroundColor = test.Vibrant.hex;
    }

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
      latestLeagueEntryId: league.id,

      mainChampionId: mainChampionId,
      mainChampionForegroundColor: mainChampionForegroundColor,
      mainChampionBackgroundColor: mainChampionBackgroundColor,

      mainIndividualPosition: maxItemBy(
        stats.statsByIndividualPosition,
        (item) => item.losses + item.wins,
      ).individualPosition,
      refreshedAt: new Date(),
    };

    await tx
      .insert(statisticTable)
      .values(statsToInsert)
      .onConflictDoUpdate({
        target: [statisticTable.puuid, statisticTable.queueType],
        set: upsert(statisticTable),
      });

    await tx
      .update(summonerTable)
      .set({
        refreshedAt: new Date(),
      })
      .where(eq(summonerTable.puuid, summoner.puuid));
  }
}
