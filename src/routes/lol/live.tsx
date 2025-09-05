import { $getFeaturedMatches } from "@/server/functions/$getFeaturedMatches";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/live")({
  component: RouteComponent,
  loader: async () => {
    const featuredGames = await $getFeaturedMatches({
      data: "euw1",
    });

    const _puuid = featuredGames.gameList
      .find((g) => g.gameQueueConfigId === 420)
      ?.participants.at(0)?.puuid;

    if (!_puuid) {
      throw new Error("No puuid");
    }

    throw redirect({
      to: "/r/$puuid",
      params: {
        puuid: _puuid,
      },
    });
  },
});

function RouteComponent() {
  return <div />;
}
