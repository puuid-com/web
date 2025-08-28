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
    <div className={"flex container mx-auto flex-col gap-5 items-center justify-center"}>
      <div className={"flex p-5"}>
        <h1 className={"text-3xl font-bold"}>Search Summoners</h1>
        <div></div>
      </div>
      <SummonerList summoners={summoners} />
    </div>
  );
}
