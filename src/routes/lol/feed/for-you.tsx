import { $getRandomSummoners } from "@/server/functions/$getRandomSummoners";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/feed/for-you")({
  component: RouteComponent,
  loader: async () => {
    const data = await $getRandomSummoners();

    return data;
  },
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return (
    <div>
      {data.map((f) => {
        return <div>{f.displayRiotId}</div>;
      })}
    </div>
  );
}
