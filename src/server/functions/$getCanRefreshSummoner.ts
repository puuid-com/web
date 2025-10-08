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
  .handler(() => {
    return {
      canRefresh: true,
    };
  });
