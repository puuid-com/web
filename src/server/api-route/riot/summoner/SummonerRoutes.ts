import { ApiRoute } from "@/server/api-route/ApiRoute";
import type { AccountDTOType } from "@/server/api-route/riot/account/AccountDTO";
import { SummonerDTOSchema } from "@/server/api-route/riot/summoner/SummonerDTO";
import { parseRateLime } from "@/server/services/rate-limiter";
import type { LolRegionType } from "@/server/types/riot/common";

export const SummonerV4ByPuuid = new ApiRoute({
  getUrl: (params: { region: LolRegionType; puuid: AccountDTOType["puuid"] }) =>
    `https://${params.region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${params.puuid}`,
  key: `summoner-v4-by-puuid`,
  limits: [parseRateLime("1600 requests every 1 minutes")],
  schema: SummonerDTOSchema,
});
