import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/summoner/$riotID/mastery")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/lol/summoner/$riotID/mastery"!</div>;
}
