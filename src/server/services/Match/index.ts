import type { MatchDTOType } from "@/server/api-route/riot/match/MatchDTO";
import {
  MatchTimelineV5ByID,
  MatchIdsV5ByPuuid,
  MatchV5ByID,
} from "@/server/api-route/riot/match/MatchRoutes";
import type { OutputPagedMatchIDsQueryParams } from "@/server/services/Match/type";
import {
  routingValueFromRegion,
  type LolRegionType,
} from "@/server/types/riot/common";
import { and, eq, exists, ilike, inArray, isNotNull, sql } from "drizzle-orm";
import { db, type TransactionType } from "@/server/db";
import type { SummonerType } from "@/server/db/schema";
import {
  matchTable,
  matchSummonerTable,
  type MatchSummonerInsertType,
  type MatchInsertType,
  type MatchRowType,
} from "@/server/db/match-schema";

export class MatchService {
  private static riotMatchQueryParamsToCacheWhereConditions(
    summoner: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams
  ) {
    const conditions = [ilike(matchTable.matchId, `${summoner.region}_%`)];

    if (params.queue) {
      conditions.push(eq(matchTable.queueId, params.queue));
    }

    return and(...conditions);
  }

  static async getMatchIdsDTOByPuuidPaged(
    summoner: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams
  ) {
    const ids = await MatchIdsV5ByPuuid.call(
      {
        routingValue: routingValueFromRegion(summoner.region),
        puuid: summoner.puuid,
      },
      { searchParams: params }
    );

    return {
      ids,
      next_start:
        ids.length === params.count ? params.start + params.count : null,
    };
  }

  static async getMatchTimelineDTOById(id: string) {
    return MatchTimelineV5ByID.call({
      routingValue: routingValueFromRegion(
        id.split("_")[0]!.toLowerCase() as LolRegionType
      ),
      id,
    });
  }

  private static getRegionFromMatchId(id: string) {
    return id.split("_")[0]!.toLowerCase() as LolRegionType;
  }

  static async getMatchDTOById(id: string): Promise<MatchDTOType> {
    return MatchV5ByID.call({
      id: id,
      routingValue: routingValueFromRegion(this.getRegionFromMatchId(id)),
    });
  }

  private static matchDTOtoDB(matchDTO: MatchDTOType): {
    match: MatchInsertType;
    summoners: MatchSummonerInsertType[];
  } {
    const match: MatchInsertType = {
      matchId: matchDTO.metadata.matchId,
      gameCreationMs: matchDTO.info.gameStartTimestamp,
      gameDurationSec: matchDTO.info.gameDuration,
      queueId: matchDTO.info.queueId,
      platformId: matchDTO.info.platformId,
    };

    const summoners: MatchSummonerInsertType[] = matchDTO.info.participants.map(
      (p) => {
        const position = p.individualPosition;
        const vsSummoner = matchDTO.info.participants.find(
          (s) => s.individualPosition === position && s.puuid !== p.puuid
        );

        return {
          matchId: matchDTO.metadata.matchId,
          puuid: p.puuid,
          gameName: p.riotIdGameName,
          tagLine: p.riotIdTagline,
          profileIconId: p.profileIcon,

          individualPosition: position,

          teamId: p.teamId,
          win: p.win,

          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,

          totalDamageDealtToChampions: p.totalDamageDealtToChampions,
          totalDamageTaken: p.totalDamageTaken,

          championId: p.championId,
          champLevel: p.champLevel,

          items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5],

          cs: p.totalMinionsKilled,

          vsSummonerPuuid: vsSummoner?.puuid ?? "cool",

          damageDealtToObjectives: p.damageDealtToObjectives,
          dragonKills: p.dragonKills,
          visionScore: p.visionScore,
          largestCriticalStrike: p.largestCriticalStrike,
          soloKills: p.challenges.soloKills ?? 0,
          wardTakedowns: p.wardsKilled,
          inhibitorKills: p.inhibitorKills,
          turretKills: p.turretKills,

          spellIds: [p.summoner1Id, p.summoner2Id],
        };
      }
    );

    return {
      match,
      summoners,
    };
  }

  static async getMatchesDTOByPuuid(
    id: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams,
    refresh: boolean = false
  ) {
    const { ids, next_start } = await MatchService.getMatchIdsDTOByPuuidPaged(
      id,
      params
    );

    const matches = await Promise.all(ids.map(this.getMatchDTOById));

    return {
      data: matches,
      next_start,
    };
  }

  static async getMatchesDBByMatchIds(matchIds: MatchRowType["matchId"][]) {
    return db.query.matchTable.findMany({
      where: inArray(matchTable.matchId, matchIds),
      with: {
        summoners: true,
      },
    });
  }

  static async getMatchesDBByPuuid(
    id: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams
  ) {
    const conditions = this.riotMatchQueryParamsToCacheWhereConditions(
      id,
      params
    );

    return db.query.matchTable.findMany({
      with: {
        summoners: {
          where: eq(matchSummonerTable.puuid, id.puuid),
        },
      },
      where: (mt, { and, eq }) =>
        and(
          conditions,
          exists(
            db
              .select({ one: sql`1` })
              .from(matchSummonerTable)
              .where(
                and(
                  eq(matchSummonerTable.matchId, mt.matchId),
                  eq(matchSummonerTable.puuid, id.puuid)
                )
              )
          )
        ),
      limit: params.count,
      offset: params.start,
    });
  }

  static async getMatchesDBCountByPuuid(
    id: Pick<SummonerType, "region" | "puuid">,
    params: Pick<OutputPagedMatchIDsQueryParams, "queue">
  ) {
    const result = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(matchTable)
      .where(
        and(
          ilike(matchTable.matchId, `${id.region}_%`),
          params.queue ? eq(matchTable.queueId, params.queue) : sql`true`,
          exists(
            db
              .select({ one: sql`1` })
              .from(matchSummonerTable)
              .where(
                and(
                  eq(matchSummonerTable.matchId, matchTable.matchId),
                  eq(matchSummonerTable.puuid, id.puuid)
                )
              )
          )
        )
      );

    return result[0]?.count ?? 0;
  }

  public static async _getAllMatcheIdsDTOByPuuid(
    id: Pick<SummonerType, "region" | "puuid">,
    queueId: MatchRowType["queueId"]
  ) {
    const ids: MatchRowType["matchId"][] = [];

    const _params: OutputPagedMatchIDsQueryParams = {
      start: 0,
      count: 100,
      queue: queueId,
    };

    let nextStart: number | null = _params.start;

    do {
      _params.start = nextStart;

      const data = await this.getMatchIdsDTOByPuuidPaged(id, _params);

      nextStart = data.next_start;

      ids.push(...data.ids);
    } while (nextStart !== null);

    return ids;
  }

  public static async saveMatchesDTOtoDBTx(
    tx: TransactionType,
    matches: MatchDTOType[]
  ) {
    if (matches.length === 0) return;

    const BATCH = 50;

    const dbData = matches.map(this.matchDTOtoDB);
    const dbMatches: MatchInsertType[] = dbData.flatMap(({ match }) => match);
    const dbSummoners: MatchSummonerInsertType[] = dbData.flatMap(
      ({ summoners }) => summoners
    );

    for (let i = 0; i < dbMatches.length; i += BATCH) {
      const chunk = dbMatches.slice(i, i + BATCH);
      await tx.insert(matchTable).values(chunk);
    }

    for (let i = 0; i < dbSummoners.length; i += BATCH) {
      const chunk = dbSummoners.slice(i, i + BATCH);
      await tx.insert(matchSummonerTable).values(chunk);
    }
  }

  public static async getAllMatchesDTOByPuuidTx(
    tx: TransactionType,
    id: Pick<SummonerType, "region" | "puuid">,
    queueId: MatchRowType["queueId"]
  ) {
    const ids = await this._getAllMatcheIdsDTOByPuuid(id, queueId);

    const alreadySavedMatches = await this.getMatchesDBByMatchIds(ids);
    const notSavedMatchIds = ids.filter(
      (id) => !alreadySavedMatches.some((m) => m.matchId === id)
    );

    const newMatches = await Promise.all(
      notSavedMatchIds.map(this.getMatchDTOById)
    );

    await this.saveMatchesDTOtoDBTx(tx, newMatches);
  }
}
