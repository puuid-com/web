import { QueueTypes } from "@/server/api-route/riot/league/LeagueDTO";
import { $getSummonerByRiotID } from "@/server/functions/$getSummonerByRiotID";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as v from "valibot";

export const Route = createFileRoute("/lol/summoner/$riotID")({
  component: RouteComponent,
  validateSearch: (data) =>
    v.parse(
      v.object({
        queue: v.exactOptional(v.picklist(QueueTypes), "RANKED_SOLO_5x5"),
      }),
      data
    ),
  loader: async (ctx) =>
    await $getSummonerByRiotID({ data: ctx.params.riotID }),
});

function RouteComponent() {
  return <Outlet />;
}
