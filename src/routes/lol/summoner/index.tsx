import { RiotIdForm } from "@/client/components/riot-id-form/RiotIdForm";
import { SummonerList } from "@/client/components/summoner-list/SummonerList";
import { Badge } from "@/client/components/ui/badge";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { DDragonService } from "@/client/services/DDragon";
import { $getSummoners } from "@/server/functions/$getSummoners";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";

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
