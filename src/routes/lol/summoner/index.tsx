import { SummonerList } from "@/client/components/summoner-list/SummonerList";
import { $getSummoners } from "@/server/functions/$getSummoners";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/summoner/")({
  component: RouteComponent,
  loader: async () => await $getSummoners(),
});

function RouteComponent() {
  const summoners = Route.useLoaderData();

  return (
    <div className={"flex container mx-auto flex-col"}>
      <SummonerList summoners={summoners} />
    </div>
  );
}
