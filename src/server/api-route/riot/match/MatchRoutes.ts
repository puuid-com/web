import { ApiRoute } from "@/server/api-route/ApiRoute";
import { CachedApiRoute } from "@/server/api-route/CacheApiRoute";
import type { AccountDTOType } from "@/server/api-route/riot/account/AccountDTO";
import {
  type MatchDTOType,
  MatchDTOSchema,
} from "@/server/api-route/riot/match/MatchDTO";
import { MatchTimelineDTOSchema } from "@/server/api-route/riot/match/MatchTimeline.dto";
import { parseRateLime } from "@/server/services/rate-limiter";
import type { LolRoutingValueType } from "@/server/types/riot/common";
import * as v from "valibot";

export const MatchIdsV5ByPuuid = new ApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    puuid: AccountDTOType["puuid"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/lol/match/v5/matches/by-puuid/${params.puuid}/ids`,
  key: `match-ids-v5-by-puuid`,
  limits: [parseRateLime("2000 requests every 10 seconds")],
  schema: v.array(v.string()),
});

export const MatchV5ByID = new CachedApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    id: MatchDTOType["metadata"]["matchId"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/lol/match/v5/matches/${params.id}`,
  key: `match-v5-by-id`,
  limits: [parseRateLime("2000 requests every 10 seconds")],
  schema: MatchDTOSchema,
  R2Dir: "match",
});

export const MatchTimelineV5ByID = new CachedApiRoute({
  getUrl: (params: {
    routingValue: LolRoutingValueType;
    id: MatchDTOType["metadata"]["matchId"];
  }) =>
    `https://${params.routingValue}.api.riotgames.com/lol/match/v5/matches/${params.id}/timeline`,
  key: `match-v5-by-id`,
  limits: [parseRateLime("2000 requests every 10 seconds")],
  schema: MatchTimelineDTOSchema,
  R2Dir: "match-timeline",
});
