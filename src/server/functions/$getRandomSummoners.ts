import { createServerFn } from "@tanstack/react-start";

export const $getRandomSummoners = createServerFn({ method: "GET" }).handler(async () => {
  const { SummonerService } = await import("@puuid/core/server/services/SummonerService");

  const data = await SummonerService.getRandomSummoners({ count: 5 });

  return data;
});

export type $getRandomSummonersType = Awaited<ReturnType<typeof $getRandomSummoners>>;
