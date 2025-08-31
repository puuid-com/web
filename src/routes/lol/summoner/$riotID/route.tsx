import { createFileRoute, Outlet } from "@tanstack/react-router";

import type React from "react";
import { SummonerNavigation } from "@/client/components/summoner/navigation/SummonerNavigation";
import { trimRiotID } from "@/lib/riotID";
import { SummonerHeader } from "@/client/components/summoner/header/SummonerHeader";
import { getSummonerByRiotIDOptions } from "@/client/queries/getSummonerByRiotID";

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
  beforeLoad: (ctx) => {
    const _riotID = trimRiotID(ctx.params.riotID);

    return ctx.context.queryClient.ensureQueryData(
      getSummonerByRiotIDOptions({
        riotID: _riotID,
      }),
    );
  },
  loader: (ctx) => {
    const summoner = ctx.context.summoner;

    const mainQueue = summoner.statistics
      .filter((s) => s.league)
      .sort((a, b) => {
        const aLeague = a.league!;
        const bLeague = b.league!;

        return aLeague.losses + aLeague.wins - bLeague.losses + bLeague.wins;
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

    const { CDragonService } = await import("@/shared/services/CDragon/CDragonService");
    const profileIconUrl = CDragonService.getProfileIcon(summoner.profileIconId);

    const meta: Record<string, string>[] = [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: profileIconUrl },
      { name: "og:image", content: profileIconUrl },
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
      className={"flex flex-col container mx-auto gap-[var(--summoner-gap-height)]"}
      style={
        {
          "--color-main": bgColor ?? undefined,
          "--color-main-foreground": textColor ?? undefined,
          "--summoner-header-height": "calc(96px + (20px * 2))",
          "--summoner-navigation-height": "calc(45px)",
          "--summoner-gap-height": "calc(20px)",
          "--summoner-outlet-height":
            "calc(var(--body-content-height) - (var(--summoner-header-height) + var(--summoner-navigation-height) + var(--summoner-gap-height) * 2)",
        } as React.CSSProperties
      }
    >
      <SummonerHeader className={"h-[var(--summoner-header-height)]"} />
      <SummonerNavigation className={"h-[var(--summoner-navigation-height)]"} />
      <div className={"flex min-h-[var(--summoner-outlet-height)] w-full"}>
        <Outlet />
      </div>
    </div>
  );
}
