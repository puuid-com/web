import FeaturedGamesUI from "@/client/components/FeaturedGames";
import { $getFeaturedMatches } from "@/server/functions/$getFeaturedMatches";
import { LolRegions } from "@puuid/core/shared/types/index";
import { createFileRoute, redirect } from "@tanstack/react-router";
import * as v from "valibot";

export const Route = createFileRoute("/lol/featured-games/$region")({
  component: RouteComponent,
  beforeLoad: (ctx) => {
    const regionParam = ctx.params.region;

    const parsed = v.safeParse(v.picklist(LolRegions), regionParam);

    if (!parsed.success) {
      throw redirect({
        to: "/",
      });
    }

    return {
      region: parsed.output,
    };
  },
  loader: (ctx) => {
    return $getFeaturedMatches({ data: ctx.context.region });
  },
});

function RouteComponent() {
  const games = Route.useLoaderData();

  return (
    <div>
      <FeaturedGamesUI data={games} />
    </div>
  );
}
