import * as v from "valibot";

const optionalStringToNumberWithDefault = (optionalValue: number) =>
  v.pipe(v.optional(v.string(), String(optionalValue)), v.transform(Number));

export const MatchIDsQueryParamsSchema = v.object({
  queue: v.number(),
  type: v.optional(v.string()),
  startTime: v.optional(v.number()),
  endTime: v.optional(v.number()),
  count: optionalStringToNumberWithDefault(9999),
  start: optionalStringToNumberWithDefault(0),
});

export type InputPagedMatchIDsQueryParams = v.InferInput<typeof MatchIDsQueryParamsSchema>;
export type OutputPagedMatchIDsQueryParams = v.InferOutput<typeof MatchIDsQueryParamsSchema>;

// You can place this above or below the MatchService class, or in a types file.

export type FormattedMatchSummonerDTOType = {
  puuid: string;
  gameName: string;
  tagLine: string;
  profileIconId: number;
  individualPosition: string;
  teamId: number;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  championId: number;
  champLevel: number;
  items: number[];
  cs: number;
  vsSummonerPuuid: string;

  inhibitorKills: number;
  turretKills: number;
  damageDealtToObjectives: number;
  dragonKills: number;
  visionScore: number;
  largestCriticalStrike: number;
  soloKills: number;
  wardTakedowns: number;

  spellIds: [number, number];
};

export type FormattedMatchDTOType = {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  queueId: number;
  platformId: string;
  summoners: FormattedMatchSummonerDTOType[];
};
