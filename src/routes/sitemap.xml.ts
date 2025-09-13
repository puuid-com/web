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

export const ServerRoute = createServerFileRoute("/sitemap/xml").methods({
  GET: async () => {
    const origin = clientEnv.VITE_CLIENT_ORIGIN;
    const total = await SitemapService.getSummonerCount();
    const pages = Math.max(1, Math.ceil(total / SITEMAP_SUMMONERS_PAGE_SIZE));
    const now = new Date().toISOString();

    const sitemaps: string[] = [];
    sitemaps.push(
      `<sitemap><loc>${xmlEscape(`${origin}/sitemap-static.xml`)}</loc><lastmod>${now}</lastmod></sitemap>`,
    );
    for (let i = 1; i <= pages; i++) {
      sitemaps.push(
        `<sitemap><loc>${xmlEscape(`${origin}/sitemap-summoners/${i}.xml`)}</loc><lastmod>${now}</lastmod></sitemap>`,
      );
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${sitemaps.join(
      "",
    )}</sitemapindex>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
      },
    });
  },
});
