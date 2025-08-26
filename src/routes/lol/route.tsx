import { DDragonService } from "@/client/services/DDragon";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/lol")({
  component: RouteComponent,
  loader: async () => await DDragonService.loadMetadata(),
  staleTime: Infinity,
});

function RouteComponent() {
  return <Outlet />;
}
