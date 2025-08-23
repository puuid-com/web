import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/summoner/$riotID/stats")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/lol/summoner/$riotID/stats"!</div>;
}
