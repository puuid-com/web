import { $getSummonerByRiotID } from "@/server/functions/$getSummonerByRiotID";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import type React from "react";
import { SummonerNavigation } from "@/client/components/summoner/navigation/SummonerNavigation";
import { trimRiotID } from "@/lib/riotID";
import { SummonerHeader } from "@/client/components/summoner/header/SummonerHeader";

export const Route = createFileRoute("/lol/summoner/$riotID")({
  component: RouteComponent,
  params: {
    parse: (raw) => ({
      riotID: decodeURIComponent(raw.riotID).normalize("NFC"),
    }),
    stringify: (v) => ({
      riotID: encodeURIComponent(v.riotID.normalize("NFC")),
    }),
  },
  loader: async (ctx) => {
    const _riotID = trimRiotID(ctx.params.riotID);

    const { summoner } = await $getSummonerByRiotID({
      data: _riotID,
    });

    const mainQueue = summoner.statistics
      .sort((a, b) => {
        return a.league.losses + a.league.wins - b.league.losses + b.league.wins;
      })
      .at(0)?.queueType;

    return {
      summoner,
      queueStats: mainQueue ? summoner.statistics.find((s) => s.queueType === mainQueue) : null,
    };
  },
  head: async ({ loaderData, params }) => {
    const summoner = loaderData?.summoner;

    if (!summoner)
      return {
        meta: [{ title: `${params.riotID.replace("-", "#")} - puuid.com` }],
      };

    const displayRiodId = summoner.displayRiotId;

    const description = `League of Legends profile for ${displayRiodId}`;
    const title = displayRiodId;

    const { CDragonService } = await import("@/client/services/CDragon");
    const profileIconUrl = CDragonService.getProfileIcon(summoner.profileIconId);

    let customProfileUrl;

    /**
     * If we refreshed, it means that we have a profile image saved to R2
     */
    if (summoner.refresh) {
      const url = `https://cdn.puuid.com/summoner-profile/${summoner.puuid}.png`;

      const lastRefreshToString = summoner.refresh.refreshedAt.toISOString();
      customProfileUrl = `${url}?v=${encodeURIComponent(lastRefreshToString)}`;
    } else {
      customProfileUrl = profileIconUrl;
    }

    const meta: Record<string, string>[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: customProfileUrl },
      { name: "og:image", content: customProfileUrl },
    ];

    return { meta, links: [{ rel: "icon", href: profileIconUrl }] };
  },
  staleTime: 60_000,
  gcTime: 30 * 60_000,

  shouldReload: true,
});

function RouteComponent() {
  const { queueStats: stats } = Route.useLoaderData();

  const bgColor = stats?.mainChampionBackgroundColor;
  const textColor = stats?.mainChampionForegroundColor;

  return (
    <div
      className={"flex flex-col container mx-auto gap-5"}
      style={
        {
          "--color-main": bgColor ?? undefined,
          "--color-main-foreground": textColor ?? undefined,
        } as React.CSSProperties
      }
    >
      <SummonerHeader />
      <SummonerNavigation />
      <div className={"flex flex-1"}>
        <Outlet />
      </div>
    </div>
  );
}
