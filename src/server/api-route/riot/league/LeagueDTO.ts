import * as v from "valibot";

export const QueueTypes = ["RANKED_SOLO_5x5", "RANKED_FLEX_SR"] as const;
export type QueueType = (typeof QueueTypes)[number];

export const LeagueDTOSchema = v.object({
  leagueId: v.string(),
  queueType: v.picklist(QueueTypes),
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
