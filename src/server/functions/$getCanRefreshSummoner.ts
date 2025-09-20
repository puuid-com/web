import { LolQueues } from "@puuid/core/shared/types/index";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getCanRefreshSummoner = createServerFn({
  method: "GET",
})
  .validator(
    v.object({
      puuid: v.string(),
      queue: v.picklist(LolQueues),
    }),
  )
  .handler(async ({ data }) => {
    const { RefreshService } = await import("@puuid/core/server/services/RefreshService");

    const canRefresh = await RefreshService.canRefresh(data.puuid, data.queue);

    return {
      canRefresh,
    };
  });
