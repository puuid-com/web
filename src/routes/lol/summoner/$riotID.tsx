import { $getSummonerByRiotID } from "@/server/functions/$getSummonerByRiotID";
import { $getSummonerMatches } from "@/server/functions/$getSummonerMatches";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import * as v from "valibot";

export const Route = createFileRoute("/lol/summoner/$riotID")({
  component: RouteComponent,
  validateSearch: (data) =>
    v.parse(
      v.object({
        start: v.exactOptional(v.number(), 0),
      }),
      data
    ),
  loaderDeps: (ctx) => {
    return {
      start: ctx.search.start,
    };
  },
  loader: async (ctx) => {
    const summoner = await $getSummonerByRiotID({ data: ctx.params.riotID });
    const matches = await $getSummonerMatches({
      data: {
        puuid: summoner.puuid,
        region: summoner.region,
        start: ctx.deps.start,
      },
    });

    return {
      summoner,
      matches,
    };
  },
});

function RouteComponent() {
  const { matches, summoner } = Route.useLoaderData();
  const metadata = useLoaderData({ from: "/lol" });

  const [gameName, tagLine] = summoner.riotId.split("#");
  return (
    <div className={"flex flex-col gap-5"}>
      <div>
        <div className={"flex items-center gap-2"}>
          <div>
            <img
              src={"metadata.urls.getProfileIconUrl(summoner.profileIconId)"}
              alt=""
              className={"w-16 aspect-square"}
            />
          </div>
          <div>
            <h1 className={"text-3xl"}>
              <span>{gameName}</span>
              <span className={"text-muted italic"}>#{tagLine}</span>
            </h1>
          </div>
        </div>
        <div className={"font-mono bg-neutral-700 rounded-md px-1"}>
          {summoner.puuid}
        </div>
      </div>
      <div className={"flex flex-col justify-center items-start"}>
        <div className={"bg-purple-500 rounded-md p-0.5"}>
          {summoner.region}
        </div>
      </div>
    </div>
  );
}
