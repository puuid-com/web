import { createServerFileRoute } from "@tanstack/react-start/server";
import { clientEnv } from "@/client/lib/env/client";
import { SitemapService, SITEMAP_SUMMONERS_PAGE_SIZE } from "@/server/services/SitemapService";

function xmlEscape(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export const ServerRoute = createServerFileRoute("/sitemap-summoners/$page/xml").methods({
  GET: async ({ params }) => {
    const origin = clientEnv.VITE_CLIENT_ORIGIN;
    const raw = params.page;
    const page = Math.max(1, Number.parseInt(raw, 10) || 1);

    const rows = await SitemapService.getSummonerPage(page, SITEMAP_SUMMONERS_PAGE_SIZE);

    const urls: string[] = rows.map(({ riotId, createdAt }) => {
      const slug = riotId.replace("#", "-");
      const loc = `${origin}/lol/summoner/${encodeURIComponent(slug)}`;
      const lastmod = createdAt.toISOString();
      return `<url><loc>${xmlEscape(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join(
      "",
    )}</urlset>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=900",
      },
    });
  },
});
