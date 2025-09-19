import { createServerFn } from "@tanstack/react-start";

export const $getChampionsData = createServerFn({ method: "GET" }).handler(async () => {
  const { ChampionService } = await import("@puuid/core/server/services/ChampionService");
  const data = await ChampionService.getChampionsData();

  return data;
});

export type $GetChampionsDataType = Awaited<ReturnType<typeof $getChampionsData>>;
