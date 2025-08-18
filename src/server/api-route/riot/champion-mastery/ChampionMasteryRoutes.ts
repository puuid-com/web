import { ApiRoute } from "@/server/api-route/ApiRoute";
import type { AccountDTOType } from "@/server/api-route/riot/account/AccountDTO";
import { MasteryDTOSchema } from "@/server/api-route/riot/champion-mastery/ChampionMasteryDTO";
import { parseRateLime } from "@/server/services/rate-limiter";
import type { LolRegionType } from "@/server/types/riot/common";

export const ChampionMasteryV4ByPuuid = new ApiRoute({
  getUrl: (params: { region: LolRegionType; puuid: AccountDTOType["puuid"] }) =>
    `https://${params.region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${params.puuid}`,
  key: `champion-mastery-v4-by-puuid`,
  limits: [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  schema: MasteryDTOSchema,
});
