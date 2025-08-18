import { ApiRoute } from "@/server/api-route/ApiRoute";
import {
  AccountDTOSchema,
  AccountRegionDTOSchema,
  type AccountDTOType,
} from "@/server/api-route/riot/account/AccountDTO";
import { parseRateLime } from "@/server/services/rate-limiter";
import type { LolRoutingValueType } from "@/server/types/riot/common";

export const AcountRegionV1ByPuuid = new ApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    puuid: AccountDTOType["puuid"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/riot/account/v1/region/by-game/lol/by-puuid/${params.puuid}`,
  key: `account-region-v1-by-puuid`,
  limits: [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  schema: AccountRegionDTOSchema,
});

export const AcountV1ByRiotID = new ApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    gameName: AccountDTOType["gameName"];
    tagLine: AccountDTOType["tagLine"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${params.gameName}/${params.tagLine}`,
  key: `account-v1-by-riot-id"`,
  limits: [parseRateLime("1000 requests every 1 minutes")],
  schema: AccountDTOSchema,
});

export const AcountV1ByPuuid = new ApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    puuid: AccountDTOType["puuid"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/riot/account/v1/accounts/by-puuid/${params.puuid}`,
  key: `account-v1-by-puuid`,
  limits: [parseRateLime("1000 requests every 1 minutes")],
  schema: AccountDTOSchema,
});

export const AcountV1ByMe = new ApiRoute({
  getUrl: (params: { routingValue: LolRoutingValueType }) =>
    `https://${params.routingValue}.api.riotgames.com/riot/account/v1/accounts/me`,
  key: `account-v1-by-me`,
  limits: [
    parseRateLime("20000 requests every 10 seconds"),
    parseRateLime("1200000 requests every 10 minutes"),
  ],
  schema: AccountDTOSchema,
});
