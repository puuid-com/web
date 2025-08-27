import { $getSummonerByRiotID } from "@/server/functions/$getSummonerByRiotID";
import { createFileRoute, Outlet } from "@tanstack/react-router";

import type React from "react";
import { SummonerHeader } from "@/client/components/summoner/SummonerHeader";
import { SummonerNavigation } from "@/client/components/summoner/navigation/SummonerNavigation";

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
    const { summoner } = await $getSummonerByRiotID({
      data: ctx.params.riotID,
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
  /* head: async ({ loaderData, params }) => {
    const summoner = loaderData?.summoner;

    if (!summoner)
      return {
        meta: [{ title: `${params.riotID.replace("-", "#")} - puuid.com` }],
      };

    const description = `League of Legends profile for ${summoner.riotId}`;
    const title = summoner.riotId;

    const { CDragonService } = await import("@/client/services/CDragon");
    const imageUrl = CDragonService.getProfileIcon(summoner.profileIconId);

    const meta: Record<string, string>[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
      { property: "og:image", content: imageUrl },
    ];

    return { meta, links: [{ rel: "icon", href: imageUrl }] };
  }, */
  staleTime: 60_000,
  gcTime: 30 * 60_000,

  shouldReload: false,
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
