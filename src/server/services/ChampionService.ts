import { db } from "@/server/db";
import { matchSummonerTable } from "@/server/db/schema/match";
import { championView, type ChampionViewType } from "@/server/db/schema/views";
import { eq, sql } from "drizzle-orm";

export class ChampionService {
  static async getChampionsData() {
    const data = await db.select().from(championView);

    return data.reduce<Record<number, ChampionViewType>>((acc, curr) => {
      acc[curr.championId] = curr;

      return acc;
    }, {});
  }

  static async getChampionData(championId: number) {
    const [data] = await db
      .select()
      .from(championView)
      .where(eq(championView.championId, championId))
      .limit(1);

    if (!data) {
      throw new Error("Champion not found");
    }

    return data;
  }

  static async getChampionStatsByPosition(championId: number) {
    const result = await db
      .select({
        position: matchSummonerTable.position,
        games: sql<number>`cast(count(*) as int)`,
        wins: sql<number>`cast(sum(case when ${matchSummonerTable.win} then 1 else 0 end) as int)`,
      })
      .from(matchSummonerTable)
      .where(eq(matchSummonerTable.championId, championId))
      .groupBy(matchSummonerTable.position);

    return result.map((r) => ({
      position: r.position,
      games: r.games,
      wins: r.wins,
      losses: r.games - r.wins,
      winRate: r.games === 0 ? 0 : r.wins / r.games,
    }));
  }
}
