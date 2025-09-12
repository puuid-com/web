import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/feed/for-you")({
  component: RouteComponent,
});

function RouteComponent() {
  // We will do this later, skip this one
  return <div>Hello "/lol/feed/for-you"!</div>;
}
