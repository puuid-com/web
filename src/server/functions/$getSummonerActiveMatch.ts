import { AccountRegionDTOSchema } from "@/server/api-route/riot/account/AccountDTO";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getSummonerActiveMatch = createServerFn({ method: "GET" })
  .validator(
    v.strictObject({
      puuid: AccountRegionDTOSchema.entries.puuid,
      region: AccountRegionDTOSchema.entries.region,
    }),
  )
  .handler(async (ctx) => {
    const { SpectatorService } = await import("@/server/services/SpectatorService");
    const data = await SpectatorService.getActiveGameData(ctx.data);

    return data;
  });

export type $GetSummonerActiveMatchType = Awaited<ReturnType<typeof $getSummonerActiveMatch>>;
