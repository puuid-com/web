import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/page/$name/")({
  component: RouteComponent,
});

function RouteComponent() {
  return null;
}
