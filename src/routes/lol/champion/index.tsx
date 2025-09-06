import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Input } from "@/client/components/ui/input";
import { Button } from "@/client/components/ui/button";
import * as React from "react";
import { useLoaderData } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/champion/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { champions } = useLoaderData({ from: "/lol" });
  const [value, setValue] = React.useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = Number(value);
    if (!isNaN(id)) {
      navigate({ to: "/lol/champion/$championId", params: { championId: id } });
    }
  };

  return (
    <div className="container mx-auto flex flex-col items-center gap-5 p-5">
      <h1 className="text-3xl font-bold">Champion Statistics</h1>
      <form onSubmit={onSubmit} className="flex gap-2 items-center">
        <Input
          list="champions-list"
          placeholder="Champion ID"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <datalist id="champions-list">
          {Object.entries(champions).map(([id, c]) => (
            <option key={id} value={id} label={c.name} />
          ))}
        </datalist>
        <Button type="submit">Go</Button>
      </form>
    </div>
  );
}
