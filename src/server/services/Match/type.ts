import * as v from "valibot";

const optionalStringToNumber = v.pipe(
  v.optional(v.string()),
  v.transform((s) => (s !== undefined ? Number(s) : undefined))
);

const optionalStringToNumberWithDefault = (optionalValue: number) =>
  v.pipe(v.optional(v.string(), String(optionalValue)), v.transform(Number));

const test = optionalStringToNumber;

type output = v.InferOutput<typeof test>;

export const MatchIDsQueryParamsSchema = v.object({
  queue: optionalStringToNumber,
  type: v.optional(v.string()),
  startTime: optionalStringToNumber,
  endTime: optionalStringToNumber,
  count: optionalStringToNumberWithDefault(10),
  start: optionalStringToNumberWithDefault(0),
});
export type MatchIDsQueryParams = v.InferOutput<
  typeof MatchIDsQueryParamsSchema
>;

export const PagedMatchIDsQueryParamsSchema = MatchIDsQueryParamsSchema;
export type InputPagedMatchIDsQueryParams = v.InferInput<
  typeof PagedMatchIDsQueryParamsSchema
>;
export type OutputPagedMatchIDsQueryParams = v.InferOutput<
  typeof PagedMatchIDsQueryParamsSchema
>;

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
  summoners: Array<FormattedMatchSummonerDTOType>;
};
