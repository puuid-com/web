import { $getSummonerByPuuid } from "@/server/functions/$getSummonerByPuuid";
import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * This route exist in the case where we do not know *for sure* the riot id of a summoner.
 *
 * Ex: We want to link the page of a participant in a match, but we only have the riot id at the time of the game,
 * if the summoner changed its name during that time, we still want the real page of the summoner.
 */
export const Route = createFileRoute("/r/$puuid")({
  component: RouteComponent,
  beforeLoad: async (ctx) => {
    const { puuid } = ctx.params;

    const { summoner } = await $getSummonerByPuuid({ data: puuid });

    throw redirect({
      to: "/lol/summoner/$riotID/matches",
      params: {
        riotID: summoner.displayRiotId.replace("#", "-"),
      },
      search: {
        q: "solo",
      },
      statusCode: 301,
    });
  },
});

function RouteComponent() {
  return <div />;
}
