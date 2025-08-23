import { LeagueV4ByPuuid } from "@/server/api-route/riot/league/LeagueRoutes";
import { db, type TransactionType } from "@/server/db";
import {
  type SummonerType,
  type LeagueRowType,
  leagueEntryTable,
} from "@/server/db/schema";
import type { LeaguesType } from "@/server/services/league/type";
import { and, eq, desc, sql } from "drizzle-orm";

export class LeagueService {
  static async cacheLeaguesTx(
    tx: TransactionType,
    id: Pick<SummonerType, "puuid" | "region">
  ): Promise<LeagueRowType[]> {
    let data = await LeagueV4ByPuuid.call({
      region: id.region,
      puuid: id.puuid,
    });

    if (data.length === 0) return [];

    return tx
      .insert(leagueEntryTable)
      .values(
        data.map((d) => ({
          region: id.region,
          leagueId: d.leagueId,
          puuid: d.puuid,

          queueType: d.queueType,
          tier: d.tier,
          rank: d.rank,

          leaguePoints: d.leaguePoints,
          wins: d.wins,
          losses: d.losses,
        }))
      )
      .onConflictDoUpdate({
        target: [
          leagueEntryTable.puuid,
          leagueEntryTable.queueType,
          leagueEntryTable.createdDate,
        ],
        set: {
          tier: sql`excluded.tier`,
          rank: sql`excluded.rank`,
          leaguePoints: sql`excluded.league_points`,
          wins: sql`excluded.wins`,
          losses: sql`excluded.losses`,
          leagueId: sql`excluded.league_id`,
          createdAt: sql`excluded.created_at`,
        },
      })
      .returning();
  }

  static async getLeaguesTx(
    tx: TransactionType,
    summoner: Pick<SummonerType, "region" | "puuid">
  ): Promise<LeaguesType> {
    const cachedLeagues = await tx
      .select()
      .from(leagueEntryTable)
      .where(
        and(
          eq(leagueEntryTable.puuid, summoner.puuid),
          eq(leagueEntryTable.region, summoner.region)
        )
      )
      .orderBy(leagueEntryTable.queueType, desc(leagueEntryTable.createdAt));

    return cachedLeagues.reduce((acc, league) => {
      if (!acc[league.queueType]) {
        acc[league.queueType] = {
          lastest: league,
          history: [],
        };
      } else {
        acc[league.queueType]!.history.push(league);
      }

      return acc;
    }, {} as LeaguesType);
  }
}
