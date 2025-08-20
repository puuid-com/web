import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { $getSummoners } from "@/server/functions/$getSummoners";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/lol/summoner/")({
  component: RouteComponent,
  loader: async () => await $getSummoners(),
});

function RouteComponent() {
  const summoners = Route.useLoaderData();

  const [player, setPlayer] = useState("OlivierDeschênes#00008");

  const handleInutChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPlayer(event.currentTarget.value);
  };

  return (
    <div>
      <div className={"flex flex-col gap-2"}>
        <Label>Riot ID</Label>
        <Input
          type="text"
          value={player}
          onChange={handleInutChange}
          placeholder={"{GameName}#{TagLine}"}
        />
        <Link
          to={"/lol/summoner/$riotID"}
          params={{ riotID: player.replace("#", "-") }}
          search={{
            queue: "RANKED_SOLO_5x5",
          }}
        >
          See
        </Link>
      </div>
      <div className={"flex gap-2.5"}>
        {summoners.map((s) => (
          <Link
            className={"bg-emerald-950/50 p-2.5 rounded-md"}
            key={`default-link-${s.puuid}`}
            to={"/lol/summoner/$riotID"}
            params={{ riotID: s.riotId.replace("#", "-") }}
            search={{
              queue: "RANKED_SOLO_5x5",
            }}
          >
            {s.riotId}
          </Link>
        ))}
      </div>
    </div>
  );
}
