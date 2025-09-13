import { createServerFileRoute } from "@tanstack/react-start/server";
import { clientEnv } from "@/client/lib/env/client";

function url(loc: string, changefreq?: string, priority?: number) {
  const ef = (s: string) => s;
  return [
    "<url>",
    `<loc>${ef(loc)}</loc>`,
    changefreq ? `<changefreq>${changefreq}</changefreq>` : "",
    typeof priority === "number" ? `<priority>${priority.toFixed(1)}</priority>` : "",
    "</url>",
  ].join("");
}

export const ServerRoute = createServerFileRoute("/sitemap-static/xml").methods({
  GET: () => {
    const origin = clientEnv.VITE_CLIENT_ORIGIN;
    const urls: string[] = [];

    urls.push(url(`${origin}/`, "daily", 0.8));
    urls.push(url(`${origin}/privacy`, "yearly", 0.2));
    urls.push(url(`${origin}/terms`, "yearly", 0.2));
    urls.push(url(`${origin}/lol/summoner/`, "daily", 0.5));
    urls.push(url(`${origin}/lol/feed`, "daily", 0.4));

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join(
      "",
    )}</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
      },
    });
  },
});
