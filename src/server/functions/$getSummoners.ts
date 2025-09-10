import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummoners = createServerFn({ method: "GET" })
  .validator(
    v.object({
      c: v.exactOptional(v.string()),
    }),
  )
  .handler(async (ctx) => {
    const { SummonerService } = await import("@/server/services/summoner/SummonerService");
    const data = await SummonerService.getSummoners(ctx.data.c);

    return data;
  });

export type $GetSummonersType = Awaited<ReturnType<typeof $getSummoners>>;
