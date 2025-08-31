import {
  SpectatorActiveGameRoute,
  SpectatorFeaturedGamesRoute,
} from "@/server/api-route/riot/spectator/SpectatorRoutes";
import type { SummonerType } from "@/server/db/schema/summoner";
import { RefreshService } from "@/server/services/RefreshService";
import { SummonerService } from "@/server/services/summoner/SummonerService";
import type { LolRegionType } from "@/server/types/riot/common";
import { HTTPError } from "ky";

export class SpectatorService {
  static async getFeaturedGames(region: LolRegionType) {
    return SpectatorFeaturedGamesRoute.call({
      region,
    });
  }

  static async getActiveGame(summoner: Pick<SummonerType, "puuid" | "region">) {
    try {
      return await SpectatorActiveGameRoute.call({
        region: summoner.region,
        puuid: summoner.puuid,
      });
    } catch (error) {
      if (error instanceof HTTPError) {
        /**
         * The summoner is simply not in a game.
         */
        if (error.response.status === 404) {
          return null;
        }
      }

      throw error;
    }
  }

  static async getActiveGameData(summoner: Pick<SummonerType, "puuid" | "region">) {
    const data = await this.getActiveGame(summoner);

    if (!data) {
      return null;
    }

    const summoners = await SummonerService.getOrCreateSummonersByPuuids(
      data.participants.map((p) => p.puuid),
    );

    const refreshedStats = await RefreshService.batchFastRefresh(
      summoners.map((s) => s.puuid),
      "RANKED_SOLO_5x5",
    );

    return {
      ...data,
      participants: data.participants.map((p) => {
        const summoner = summoners.find((s) => s.puuid === p.puuid)!;
        const stats = refreshedStats.find((s) => s.puuid === p.puuid);

        return {
          ...p,
          summoner,
          stats: stats ?? null,
        };
      }),
    };
  }
}
