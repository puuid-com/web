import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerByRiotID = createServerFn({ method: "GET" })
  .validator(v.string())
  .handler(async (ctx) => {
    const riotID = ctx.data;

    const { IDService } = await import("@/server/services/ID");
    const data = await IDService.getByRiotID(riotID.replace("-", "#"));

    return data;
  });
