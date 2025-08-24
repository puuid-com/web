import * as v from "valibot";

export const MasteryDTOSchema = v.pipe(
  v.array(
    v.object({
      puuid: v.string(),
      championId: v.number(),
      championLevel: v.number(),
      championPoints: v.number(),
      lastPlayTime: v.pipe(
        v.union([v.string(), v.number()]),
        v.transform((input) => new Date(input).toISOString()),
      ),
    }),
  ),
  v.transform((data) => ({
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    puuid: data.pop()?.puuid!,
    data: data.map((d) => ({
      champion: {
        id: d.championId,
      },
      puuid: d.puuid,
      level: d.championLevel,
      points: d.championPoints,
      lastPlayTime: d.lastPlayTime,
    })),
    created_at: new Date().toISOString(),
  })),
);
export type MasteryDTOType = v.InferInput<typeof MasteryDTOSchema>;
export type MasteryType = v.InferOutput<typeof MasteryDTOSchema>;
