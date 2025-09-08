import { trimRiotID } from "@/lib/riotID";
import { LolQueues } from "@/server/api-route/riot/league/LeagueDTO";
import { LOL_QUEUES } from "@/server/services/match/queues";
import { createServerFn } from "@tanstack/react-start";
import * as v from "valibot";

export const $getAllSummonerMatchesByRiotID = createServerFn({ method: "GET" })
  .validator(
    v.object({
      riotId: v.string(),
      queue: v.picklist(LolQueues),
    }),
  )
  .handler(async (ctx) => {
    await new Promise<void>((resolve) => setTimeout(resolve, 2000));

    const { riotId, queue } = ctx.data;

    const { MatchService } = await import("@/server/services/match/MatchService");
    const matches = await MatchService.getAllMatchesDBByRiotIDSmall(
      {
        riotId: trimRiotID(riotId),
      },
      {
        queue: LOL_QUEUES[queue].queueId,
      },
    );

    return {
      matches,
    };
  });

export type $GetAllSummonerMatchesByRiotIDType = Awaited<
  ReturnType<typeof $getAllSummonerMatchesByRiotID>
>;
