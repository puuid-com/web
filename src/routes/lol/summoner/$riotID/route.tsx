import { createFileRoute } from "@tanstack/react-router";

import { trimRiotID } from "@/lib/riotID";
import { getSummonerByRiotIDOptions } from "@/client/queries/getSummonerByRiotID";
import { MainChampionProvider } from "@/client/context/MainChampionContext";
import { SummonerPage } from "@/client/components/summoner/SummonerPage";
import * as v from "valibot";
import { FriendlyQueueTypes, friendlyQueueTypeToRiot } from "@/client/lib/typeHelper";

export const Route = createFileRoute("/lol/summoner/$riotID")({
  component: RouteComponent,
  validateSearch: (raw) =>
    v.parse(
      v.object({
        /**
         * Queue
         */
        q: v.exactOptional(v.picklist(FriendlyQueueTypes), "solo"),
      }),
      raw,
    ),
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
  loaderDeps: (ctx) => ({
    search: {
      queue: ctx.search.q,
    },
  }),
  loader: (ctx) => {
    const summoner = ctx.context.summoner;
    const queue = friendlyQueueTypeToRiot(ctx.deps.search.queue);

    return {
      summoner,
      queueStats: summoner.statistics.find((s) => s.queueType === queue) ?? null,
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

    const { CDragonService } = await import("@puuid/core/shared/services/CDragonService");
    const { clientEnv } = await import("@/client/lib/env/client");
    const profileIconUrl = CDragonService.getProfileIcon(summoner.profileIconId);
    const canonicalUrl = `${clientEnv.VITE_CLIENT_ORIGIN}/lol/summoner/${params.riotID}`;

    const meta: Record<string, string>[] = [
      { title },
      { name: "description", content: description },
      { property: "og:url", content: canonicalUrl },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: profileIconUrl },
      { name: "og:image", content: profileIconUrl },
    ];

    const headScripts = [
      {
        type: "application/ld+json",
        // JSON-LD describing the profile
        children: JSON.stringify(
          {
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            url: canonicalUrl,
            name: displayRiodId,
            about: description,
            thumbnailUrl: profileIconUrl,
            mainEntity: {
              "@type": "Person",
              name: displayRiodId,
              identifier: summoner.riotId,
            },
          },
          null,
          0,
        ),
      },
    ];

    return {
      meta,
      links: [
        { rel: "icon", href: profileIconUrl },
        { rel: "canonical", href: canonicalUrl },
      ],
      headScripts,
    };
  },
  staleTime: 60_000,
  gcTime: 30 * 60_000,

  shouldReload: true,
});

function RouteComponent() {
  const { queueStats: stats } = Route.useLoaderData();

  return (
    <MainChampionProvider statistic={stats}>
      <SummonerPage />
    </MainChampionProvider>
  );
}
