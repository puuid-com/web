import { $tryUserMiddleware } from "@/server/middleware/$tryUserMiddleware";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummoners = createServerFn({ method: "GET" })
  .middleware([$tryUserMiddleware])
  .validator(
    v.object({
      c: v.exactOptional(v.string()),
    }),
  )
  .handler(async (ctx) => {
    const userId = ctx.context.userId;

    const { SummonerService } = await import(
      "@puuid/core/server/services/summoner/SummonerService"
    );
    const data = await SummonerService.getSummoners({
      userId,
      search: ctx.data.c,
      limit: 5,
    });

    return data;
  });

export type $GetSummonersType = Awaited<ReturnType<typeof $getSummoners>>;
