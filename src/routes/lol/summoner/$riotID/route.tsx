"use client";

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
import { Clock3, PawPrintIcon, RatIcon } from "lucide-react";
import * as v from "valibot";

import type React from "react";
import { useEffect, useState } from "react";
import { cn, timeago } from "@/client/lib/utils";
import { SummonerSidebarStatsByChampionId } from "@/client/components/summoner/sidebar/SummonerSidebarStatsByChampion";
import { MatchList } from "@/client/components/match-list/MatchList";
import { SummonerSidebarFilters } from "@/client/components/summoner/sidebar/SummonerSidebarFilters";

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

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const bodyContent = document.getElementById("body-content");
      if (!bodyContent) return;

      const currentScrollY = bodyContent.scrollTop;
      requestAnimationFrame(() => {
        setScrollY(currentScrollY);
      });
    };

    const bodyContent = document.getElementById("body-content");
    if (bodyContent) {
      bodyContent.addEventListener("scroll", handleScroll, { passive: true });
      return () => bodyContent.removeEventListener("scroll", handleScroll);
    }
  }, []);

  const maxScroll = 100;
  const scrollProgress = Math.min(scrollY / maxScroll, 1);

  console.log(
    "[v0] scrollY:",
    scrollY,
    "scrollProgress:",
    scrollProgress,
    "headerHeight:",
    180 - 60 * scrollProgress
  );

  const iconSize = 128 - 96 * scrollProgress;

  const statsOpacity = 1 - Math.min(scrollProgress * 3, 1);

  const padding = 20 - 12 * scrollProgress;

  const bgMixPercent = 30 + 70 * scrollProgress;

  const headerHeight = iconSize + padding * 2; // Shrinks from 180px to 120px
  const gapSize = 20 - 15 * scrollProgress; // Reduces gap from 20px to 5px
  const titleSize = scrollProgress > 0.3 ? "text-lg" : "text-2xl"; // Smaller title when scrolled
  const hideSecondaryInfo = scrollProgress > 0.6; // Hide secondary info when mostly scrolled

  const minR = 12;
  const maxR = iconSize / 2;
  const borderRadiusPx = minR + (maxR - minR) * scrollProgress;

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
      <div
        className={
          "rounded-b-3xl overflow-hidden sticky top-0 z-10 transition-all duration-300 ease-out"
        }
        style={{
          padding: `${padding}px`,
          backgroundColor: `color-mix(in oklab, var(--color-main) ${bgMixPercent}%, transparent)`,
          height: `${headerHeight}px`,
        }}
      >
        {stats?.mainChampionId ? (
          <>
            <img
              src={
                DDragonService.getChampionLoadingScreenImage(
                  metadata.champions,
                  stats?.mainChampionId
                ) ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg" ||
                "/placeholder.svg"
              }
              alt="Decor"
              className="absolute bottom-[-250px] right-[100px] h-full object-cover scale-400
               mask-l-from-5% opacity-50"
            />
          </>
        ) : null}
        <div
          className={cn(
            "flex flex-col h-full transition-all duration-300 ease-out",
            scrollProgress > 0.3 ? "justify-start" : "justify-center"
          )}
          style={{ gap: `${gapSize}px` }}
        >
          <div className={"flex gap-2.5"}>
            <div
              className="relative flex-shrink-0 object-cover bg-cover"
              style={{
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                borderRadius: `${borderRadiusPx}px`,
                backgroundImage: `url(${DDragonService.getProfileIconUrl(
                  metadata.latest_version,
                  summoner.profileIconId
                )})`,
                willChange: "border-radius",
              }}
            >
              <div
                className={
                  "absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2 transition-opacity duration-300 ease-out border-inherit"
                }
                style={{
                  opacity: statsOpacity,
                  pointerEvents: statsOpacity < 0.1 ? "none" : "auto",
                }}
              >
                <Badge
                  variant={"secondary"}
                  className={"border-main/ bg-main/70"}
                >
                  {summoner.summonerLevel}
                </Badge>
              </div>
            </div>
            <div
              className={cn(
                "flex flex-col min-w-0 flex-1 transition-all duration-300 ease-out",
                scrollProgress > 0.3 ? "justify-start" : "justify-between"
              )}
            >
              <div>
                <div className={"flex gap-2.5 items-center"}>
                  <Link
                    to={"/lol/summoner/$riotID"}
                    params={params}
                    search={search}
                  >
                    <h1
                      className={cn(
                        "transition-all duration-300 ease-out",
                        titleSize
                      )}
                    >
                      <span className={"font-bold"}>{gameName}</span>
                      <span className={"text-neutral-500"}>#{tagLine}</span>
                    </h1>
                  </Link>
                </div>
                {!hideSecondaryInfo && (
                  <div
                    className="transition-opacity duration-300 ease-out"
                    style={{
                      opacity: statsOpacity,
                      pointerEvents: statsOpacity < 0.1 ? "none" : "auto",
                    }}
                  >
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
                )}
              </div>
              {stats && !hideSecondaryInfo ? (
                <div
                  className="transition-opacity duration-300 ease-out"
                  style={{
                    opacity: statsOpacity,
                    pointerEvents: statsOpacity < 0.1 ? "none" : "auto",
                  }}
                >
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
      <div className={"flex gap-10"}>
        <div
          className={
            "flex flex-col gap-10 w-70 sticky self-start basis-70 shrink-0"
          }
          style={{
            top: `${headerHeight + 40}px`,
          }}
        >
          <SummonerSidebarFilters />
          <SummonerSidebarStatsByChampionId
            statsByChampionId={stats?.statsByChampionId}
            iconName={PawPrintIcon}
            label={"Stats By Champion"}
          />
          <SummonerSidebarStatsByChampionId
            statsByChampionId={
              stats?.statsByOppositeIndividualPositionChampionId
            }
            iconName={RatIcon}
            label={"Stats by Matchup"}
          />
        </div>
        <div className={"flex flex-1"}>
          <MatchList summoner={summoner} queue={search.queue} />
        </div>
      </div>
    </div>
  );
}
