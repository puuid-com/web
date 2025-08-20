import type { TransactionType } from "@/server/db";
import type { MatchSummonerRowType } from "@/server/db/match-schema";
import type { SummonerType } from "@/server/db/schema";
import { LeagueService } from "@/server/services/League";
import { MatchService } from "@/server/services/Match";
import {
  type LoLQueueKeyType,
  getQueueByKey,
} from "@/server/services/Match/queues.type";

export type Stat = {
  wins: number;
  losses: number;
  kills: number;
  assists: number;
  deaths: number;
};

const getInitialStat = (): Stat => ({
  wins: 0,
  losses: 0,
  kills: 0,
  assists: 0,
  deaths: 0,
});

export class StatisticService {
  static MATCHES_COUNTED: number = 9999;

  static async getSummonerStatisticTx(
    tx: TransactionType,
    summoner: Pick<SummonerType, "region" | "puuid">,
    queue: LoLQueueKeyType
  ) {
    const matches = await MatchService.getMatchesDBByPuuid(summoner, {
      count: this.MATCHES_COUNTED,
      queue: getQueueByKey(queue).queueId,
      start: 0,
    });

    const statsByChampionId = matches
      .reduce(
        (acc, m) => {
          const summoner = m.summoners[0]!;

          if (!acc.some((s) => s.championId === summoner.championId)) {
            acc.push({
              championId: summoner.championId,
              ...getInitialStat(),
            });
          }

          const championStats = acc.find(
            (s) => s.championId === summoner.championId
          )!;

          if (summoner.win) {
            championStats.wins += 1;
          } else {
            championStats.losses += 1;
          }

          championStats.kills += summoner.kills;
          championStats.assists += summoner.assists;
          championStats.deaths += summoner.deaths;

          return acc;
        },
        [] as (Stat & {
          championId: MatchSummonerRowType["championId"];
        })[]
      )
      .sort((a, b) => b.wins + b.losses - (a.wins + a.losses));

    const stats = statsByChampionId.reduce((acc, curr) => {
      acc.wins += curr.wins;
      acc.losses += curr.losses;
      acc.kills += curr.kills;
      acc.assists += curr.assists;
      acc.deaths += curr.deaths;

      return acc;
    }, getInitialStat());

    const leagues = await LeagueService.getLeaguesTx(tx, summoner);

    return {
      statsByChampionId,
      stats,
      leagues,
    };
  }
}
