import type { SummonerType } from "@/server/db/schema";
import type { MasteryType } from "@/server/api-route/riot/champion-mastery/ChampionMasteryDTO";
import { ChampionMasteryV4ByPuuid } from "@/server/api-route/riot/champion-mastery/ChampionMasteryRoutes";
import { DDragonService } from "@/client/services/DDragon";
import { CacheService } from "@/server/services/cache/CacheService";

export class MasteryService {
  static async getMasteryByPUUID(id: SummonerType, refresh = false) {
    const cachedData = await CacheService.tryGetFileFromCache<MasteryType>(id.puuid, "mastery");

    if (cachedData && !refresh) {
      return cachedData;
    }

    const parsedResponse = await ChampionMasteryV4ByPuuid.call({
      region: id.region,
      puuid: id.puuid,
    });

    parsedResponse.puuid = id.puuid;

    const version = await DDragonService.getLatestVersion();
    const data = await DDragonService.getChampionsData(version);

    const formattedParsedData: MasteryType = {
      ...parsedResponse,
      data: parsedResponse.data.map((d) => ({
        ...d,
        champion: {
          ...d.champion,
          name: data[d.champion.id]!.name,
          image: data[d.champion.id]!.image,
        },
      })),
    };

    await CacheService.saveToCache(id.puuid, formattedParsedData, "mastery");

    return formattedParsedData;
  }
}
