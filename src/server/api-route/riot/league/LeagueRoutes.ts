import { ApiRoute } from "@/server/api-route/ApiRoute";
import type { AccountDTOType } from "@/server/api-route/riot/account/AccountDTO";
import { LeagueDTOSchema } from "@/server/api-route/riot/league/LeagueDTO";
import { parseRateLime } from "@/server/services/rate-limiter";
import type { LolRegionType } from "@/server/types/riot/common";
import * as v from "valibot";

export const LeagueV4ByPuuid = new ApiRoute({
  getUrl: (params: { region: LolRegionType; puuid: AccountDTOType["puuid"] }) =>
    `https://${params.region}.api.riotgames.com/lol/league/v4/entries/by-puuid/${params.puuid}`,
  key: `"league-v4-by-puuid"`,
  limits: [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  schema: v.array(LeagueDTOSchema),
});
