import {
  matchSummoner,
  type SummonerType,
  matchTable,
  type MatchType,
  type MatchSummonerType,
} from "@/server/db/schema";
import type { MatchDTOType } from "@/server/api-route/riot/match/MatchDTO";
import {
  MatchTimelineV5ByID,
  MatchIdsV5ByPuuid,
  MatchV5ByID,
} from "@/server/api-route/riot/match/MatchRoutes";
import type {
  OutputPagedMatchIDsQueryParams,
  FormattedMatchDTO,
} from "@/server/services/Match/type";
import { CacheService } from "@/server/services/cache/CacheService";
import {
  routingValueFromRegion,
  type LolRegionType,
} from "@/server/types/riot/common";
import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";

export class MatchService {
  static async getMatchIdsByPuuidPaged(
    summoner: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams
  ) {
    const ids = await this.fetchMatchIds(summoner, params);

    return {
      ids,
      next_start:
        ids.length === params.count ? params.start + params.count : null,
    };
  }

  static async getMatchTimelineById(id: string) {
    return MatchTimelineV5ByID.call({
      routingValue: routingValueFromRegion(
        id.split("_")[0]!.toLowerCase() as LolRegionType
      ),
      id,
    });
  }

  private static async fetchMatchIds(
    summoner: Pick<SummonerType, "region" | "puuid">,
    params: OutputPagedMatchIDsQueryParams
  ) {
    return MatchIdsV5ByPuuid.call(
      {
        routingValue: routingValueFromRegion(summoner.region),
        puuid: summoner.puuid,
      },
      { searchParams: params }
    );
  }

  static async getMatchIdsByPuuid(
    summoner: SummonerType,
    params: OutputPagedMatchIDsQueryParams
  ) {
    return this.fetchMatchIds(summoner, params);
  }

  private static async gameIsCached(id: typeof matchTable.$inferSelect.id) {
    const data = await db
      .select()
      .from(matchTable)
      .where(eq(matchTable.id, id));

    return !!data.length;
  }

  static async getMatchesAggByPuuid(
    summoner: SummonerType,
    params: OutputPagedMatchIDsQueryParams,
    filterBySummoner?: SummonerType["puuid"]
  ) {
    const ids = await this.getMatchIdsByPuuid(summoner, params);

    return this.getMatchesAggByIds(ids, filterBySummoner);
  }

  static async getMatchesAggByIds(
    ids: MatchType["id"][],
    filterBySummoner?: SummonerType["puuid"]
  ) {
    return Promise.all(
      ids.map((id) => this.getMatchAggById(id, filterBySummoner))
    );
  }

  static async getMatchAggById(
    id: string,
    filterBySummoner?: SummonerType["puuid"]
  ): Promise<{ match: MatchType; summoners: MatchSummonerType[] }> {
    const match = await db.query.matchTable.findFirst({
      where: eq(matchTable.id, id),
    });

    if (match) {
      const idCondition = eq(matchSummoner.matchId, id);
      const whereConditions = filterBySummoner
        ? and(eq(matchSummoner.puuid, filterBySummoner), idCondition)
        : idCondition;

      const summoners = await db.query.matchSummoner.findMany({
        where: whereConditions,
      });

      return {
        match: match,
        summoners,
      };
    }

    const region = id.split("_")[0]!.toLowerCase() as LolRegionType;
    const matchResponse = await MatchV5ByID.call({
      routingValue: routingValueFromRegion(region),
      id,
    });
    await CacheService.saveToCache(id, match, "match");
    return this.saveMatch(matchResponse);
  }

  static async getMatchById(
    id: string,
    check_cache: boolean = true
  ): Promise<FormattedMatchDTO> {
    const isCached = check_cache ? await this.gameIsCached(id) : false;

    if (isCached) {
      const cached = await CacheService.tryGetFileFromCache<MatchDTOType>(
        id,
        "match"
      );

      if (cached) {
        return this.formatMatchDTO(cached!);
      } else {
        await db.delete(matchTable).where(eq(matchTable.id, id));
        await db.delete(matchSummoner).where(eq(matchSummoner.matchId, id));
      }
    }

    const region = id.split("_")[0]!.toLowerCase() as LolRegionType;

    const [match, timeline] = await Promise.all([
      MatchV5ByID.call({
        routingValue: routingValueFromRegion(region),
        id,
      }),
      MatchTimelineV5ByID.call({
        routingValue: routingValueFromRegion(region),
        id,
      }),
    ]);

    await this.saveMatch(match);

    return this.formatMatchDTO(match);
  }

  private static formatMatchDTO(match: MatchDTOType): FormattedMatchDTO {
    return {
      matchId: match.metadata.matchId,
      gameCreation: match.info.gameStartTimestamp,
      gameDuration: match.info.gameDuration,
      queueId: match.info.queueId,
      platformId: match.info.platformId,
      summoners: match.info.participants.map((p) => {
        const position = p.individualPosition;
        const vsSummoner = match.info.participants.find(
          (s) => s.individualPosition === position && s.puuid !== p.puuid
        );

        console.log({ vsSummoner: vsSummoner?.puuid });

        return {
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
      }),
    };
  }

  private static async saveMatch(match: MatchDTOType) {
    const matchAgg: typeof matchTable.$inferInsert = {
      gameDurationSec: match.info.gameDuration,
      gameStartAt: new Date(match.info.gameStartTimestamp),
      id: match.metadata.matchId,
      queueId: match.info.queueId,
      r2Key: this.createMatchR2Key(match),
      type: match.info.gameType,
    };

    const matchId = match.metadata.matchId;

    const matchSummonerData: (typeof matchSummoner.$inferInsert)[] =
      match.info.participants.map((p) => {
        return {
          matchId: matchId,
          puuid: p.puuid,
          teamId: p.teamId,
          win: p.win,
          championId: p.championId,
          individualPosition: p.individualPosition,
          kills: p.kills,
          deaths: p.deaths,
          assists: p.assists,
          cs: p.totalMinionsKilled,
          gold: p.goldEarned,
          damageDealt: p.totalDamageDealtToChampions,
          damageTaken: p.totalDamageTaken,
        };
      });

    return db.transaction(async (tx) => {
      const match = await tx.insert(matchTable).values(matchAgg).returning();
      const summoners = await tx
        .insert(matchSummoner)
        .values(matchSummonerData)
        .returning();

      return {
        match: match[0]!,
        summoners,
      };
    });
  }

  static createMatchR2Key(match: MatchDTOType) {
    return `match/${match.metadata.matchId}`;
  }

  static async getMatchesByPUUID(
    id: SummonerType,
    params: OutputPagedMatchIDsQueryParams
  ) {
    const { ids, next_start } = await MatchService.getMatchIdsByPuuidPaged(
      id,
      params
    );

    const matches = await Promise.all(
      ids.map((id) => this.getMatchById(id, true))
    );

    return {
      data: matches,
      next_start,
    };
  }
}
