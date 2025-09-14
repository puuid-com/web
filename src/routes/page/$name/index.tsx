import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/page/$name/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <h2>Hello "/page/$name/"!</h2>
    </div>
  );
}
