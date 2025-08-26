import {
  SpectatorActiveGameRoute,
  SpectatorFeaturedGamesRoute,
} from "@/server/api-route/riot/spectator/SpectatorRoutes";
import type { SummonerType } from "@/server/db/schema";
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
}
