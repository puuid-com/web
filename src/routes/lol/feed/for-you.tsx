import { $getRandomSummoners } from "@/server/functions/$getRandomSummoners";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/feed/for-you")({
  component: RouteComponent,
  loader: async () => {
    const data = await $getRandomSummoners();

    return data;
  },
  staleTime: 1000 * 30,
  gcTime: 1000 * 60 * 5,
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return (
    <div>
      {data.map((f) => {
        return <div key={f.puuid}>{f.displayRiotId}</div>;
      })}
    </div>
  );
}
