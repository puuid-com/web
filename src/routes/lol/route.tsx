import { $getChampionsData } from "@/server/functions/$getChampionsData";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/lol")({
  component: RouteComponent,
  loader: async () => {
    const metadata = await DDragonService.loadMetadata();
    const champions = await $getChampionsData();

    return {
      ...metadata,
      championsData: champions,
    };
  },
  staleTime: Infinity,
});

function RouteComponent() {
  return <Outlet />;
}
