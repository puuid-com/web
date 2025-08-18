import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/lol/summoner/")({
  component: RouteComponent,
});

function RouteComponent() {
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
            start: 0,
          }}
        >
          See
        </Link>
      </div>
    </div>
  );
}
