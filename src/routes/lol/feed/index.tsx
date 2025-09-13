import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/feed/")({
  beforeLoad: () => {
    throw redirect({ to: "/lol/feed/following" });
  },
});

