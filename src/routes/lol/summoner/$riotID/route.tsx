import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { DDragonService } from "@/client/services/DDragon";
import { LolQueues } from "@/server/api-route/riot/league/LeagueDTO";
import { $getSummonerByRiotID } from "@/server/functions/$getSummonerByRiotID";
import { $getSummonerStatsByPuuid } from "@/server/functions/$getSummonerStatsByPuuid";
import {
  createFileRoute,
  Link,
  Outlet,
  useLoaderData,
} from "@tanstack/react-router";
import { Clock3 } from "lucide-react";
import * as v from "valibot";

import React from "react";
import { timeago } from "@/client/lib/utils";

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
  validateSearch: (data) =>
    v.parse(
      v.object({
        queue: v.exactOptional(v.picklist(LolQueues), "RANKED_SOLO_5x5"),
      }),
      data
    ),
  loaderDeps: (ctx) => {
    return {
      search: ctx.search,
    };
  },
  loader: async (ctx) => {
    const { summoner } = await $getSummonerByRiotID({
      data: ctx.params.riotID,
    });
    const stats = await $getSummonerStatsByPuuid({
      data: {
        puuid: summoner.puuid,
        queue: ctx.deps.search.queue,
      },
    });

    return {
      summoner,
      stats,
    };
  },
});

function RouteComponent() {
  const { summoner, stats } = Route.useLoaderData();

  const params = Route.useParams();
  const search = Route.useSearch();

  const metadata = useLoaderData({ from: "/lol" });

  const [gameName, tagLine] = summoner.riotId.split("#");

  const bgColor = stats?.mainChampionBackgroundColor;
  const textColor = stats?.mainChampionForegroundColor;

  return (
    <div
      className={"flex flex-col container mx-auto gap-10"}
      style={
        {
          "--color-main": bgColor ?? undefined,
          "--color-main-foreground": textColor ?? undefined,
        } as React.CSSProperties
      }
    >
      <div className={"rounded-b-3xl p-5 relative overflow-hidden bg-main/30"}>
        {stats?.mainChampionId ? (
          <>
            <img
              src={DDragonService.getChampionLoadingScreenImage(
                metadata.champions,
                stats?.mainChampionId
              )}
              alt="Decor"
              className="absolute bottom-[-250px] right-[100px] h-full object-cover scale-400
               mask-l-from-5% opacity-50"
            />
          </>
        ) : null}
        <div className={"flex flex-col gap-5"}>
          <div className={"flex gap-2.5"}>
            <div className={"relative"}>
              <img
                src={DDragonService.getProfileIconUrl(
                  metadata.latest_version,
                  summoner.profileIconId
                )}
                alt={`${summoner.riotId} profil icon`}
                className={"w-32 rounded-md"}
              />
              <div
                className={
                  "absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2"
                }
              >
                <Badge
                  variant={"secondary"}
                  className={"border-main/ bg-main/70"}
                >
                  {summoner.summonerLevel}
                </Badge>
              </div>
            </div>
            <div className={"flex flex-col justify-between"}>
              <div>
                <div className={"flex gap-2.5 items-center"}>
                  <Link
                    to={"/lol/summoner/$riotID"}
                    params={params}
                    search={search}
                  >
                    <h1 className={"text-2xl"}>
                      <span className={"font-bold"}>{gameName}</span>
                      <span className={"text-neutral-500"}>#{tagLine}</span>
                    </h1>
                  </Link>
                </div>
                <div>
                  <Button size={"xs"} asChild>
                    <Link
                      to={"/lol/summoner/$riotID/refresh"}
                      params={params}
                      search={search}
                    >
                      <Clock3 />
                      Refreshed{" "}
                      <span className={"font-bold"}>
                        {timeago(summoner.refreshedAt)}
                      </span>{" "}
                      ago
                    </Link>
                  </Button>
                </div>
              </div>
              {stats ? (
                <div>
                  <div>Main Position : {stats?.mainIndividualPosition}</div>
                  <div>
                    Main Champion:{" "}
                    {DDragonService.getChampionName(
                      metadata.champions,
                      stats?.mainChampionId
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
