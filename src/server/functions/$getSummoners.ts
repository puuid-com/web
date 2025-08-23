import { createServerFn } from "@tanstack/react-start";

export const $getSummoners = createServerFn({ method: "GET" }).handler(
  async () => {
    const { SummonerService } = await import("@/server/services/summoner");
    const data = await SummonerService.getSummoners();

    return data;
  }
);
