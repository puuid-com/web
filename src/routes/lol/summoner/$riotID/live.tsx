import { Button } from "@/client/components/ui/button";
import { DDragonService } from "@/client/services/DDragon";
import { $getActiveGames } from "@/server/functions/$getActiveMatch";
import { $getFeaturedMatches } from "@/server/functions/$getFeaturedMatches";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/summoner/$riotID/live")({
  component: RouteComponent,
  loader: () => {
    return $getFeaturedMatches({ data: "na1" });
  },
});

function RouteComponent() {
  const { gameList } = Route.useLoaderData();
  const metadata = useLoaderData({ from: "/lol" });

  // eslint-disable-next-line
  const _puuid = gameList[0]?.participants[0]?.puuid!;

  const { data, refetch, status, error } = useQuery({
    queryFn: () =>
      $getActiveGames({
        data: {
          puuid: _puuid,
          region: "na1",
        },
      }),
    queryKey: ["summoner", "activeGame", _puuid],
  });

  if (status === "pending") {
    return <div>Loading...</div>;
  }

  if (status === "error") {
    return <div>Error: {error.message}</div>;
  }

  if (data === null) {
    return (
      <div>
        <h1>No active game found.</h1>
        <Button
          onClick={() => {
            refetch().catch(console.error);
          }}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1>Active Game</h1>
      <div>
        {data.participants.map((participant) => (
          <div className={"flex items-center gap-2"} key={participant.puuid}>
            <img
              src={DDragonService.getProfileIconUrl(
                metadata.latest_version,
                participant.profileIconId,
              )}
              className={"w-6 aspect-square"}
              alt=""
            />
            <div key={participant.puuid}>{participant.riotId}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
