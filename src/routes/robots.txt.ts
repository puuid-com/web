import { createServerFileRoute } from "@tanstack/react-start/server";
import { clientEnv } from "@/client/lib/env/client";

export const ServerRoute = createServerFileRoute("/robots/txt").methods({
  GET: () => {
    const origin = clientEnv.VITE_CLIENT_ORIGIN;
    const body = ["User-agent: *", "Allow: /", `Sitemap: ${origin}/sitemap.xml`, ""].join("\n");

    return new Response(body, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  },
});
