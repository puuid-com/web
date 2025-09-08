import { createFileRoute } from "@tanstack/react-router";

import { trimRiotID } from "@/lib/riotID";
import { getSummonerByRiotIDOptions } from "@/client/queries/getSummonerByRiotID";
import { ChampionProvider } from "@/client/context/MainChampionContext";
import { SummonerPage } from "@/client/components/summoner/SummonerPage";

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

  const bgColor = stats?.mainChampionBackgroundColor ?? undefined;
  const textColor = stats?.mainChampionForegroundColor ?? undefined;
  const skinId = stats?.mainChampionSkinId ?? undefined;

  return (
    <ChampionProvider backgroundColor={bgColor} foregroundColor={textColor} skinId={skinId}>
      <SummonerPage />
    </ChampionProvider>
  );
}
