import * as v from "valibot";

export const LeagueDTOSchema = v.object({
  leagueId: v.string(),
  queueType: v.string(),
  tier: v.string(),
  rank: v.optional(v.string()),
  puuid: v.string(),
  leaguePoints: v.number(),
  wins: v.number(),
  losses: v.number(),
  veteran: v.boolean(),
  inactive: v.boolean(),
  freshBlood: v.boolean(),
  hotStreak: v.boolean(),
});
export type LeagueDTOType = v.InferInput<typeof LeagueDTOSchema>;
