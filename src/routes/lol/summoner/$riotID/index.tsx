import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/summoner/$riotID/")({
  component: RouteComponent,
  beforeLoad: (ctx) => {
    throw redirect({
      to: "/lol/summoner/$riotID/matches",
      params: ctx.params,
      search: {
        q: "solo",
      },
    });
  },
});

function RouteComponent() {
  return <div>Hello "/lol/summoner/$riotID/"!</div>;
}
