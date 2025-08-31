import { createServerFn } from "@tanstack/react-start";

export const $getChampionsData = createServerFn({ method: "GET" }).handler(async () => {
  const { ChampionService } = await import("@/server/services/ChampionService");
  const data = await ChampionService.getChampionsData();

  return data;
});

export type $GetChampionsDataType = Awaited<ReturnType<typeof $getChampionsData>>;
