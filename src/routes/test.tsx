import { SummonerService } from "@puuid/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/test")({
  component: RouteComponent,
  loader: async () => {
    const summoners = await SummonerService.getSummoners();

    return {
      summoners,
    };
  },
});

function RouteComponent() {
  const { summoners } = Route.useLoaderData();

  return (
    <div>
      <div>
        {summoners.map((s) => {
          return <div key={s.summoner.puuid}>{s.summoner.displayRiotId}</div>;
        })}
      </div>
    </div>
  );
}
