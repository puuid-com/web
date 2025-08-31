import { cn } from "@/client/lib/utils";
import type { $GetSummonerActiveMatchType } from "@/server/functions/$getSummonerActiveMatch";
import { Link, useLoaderData, useRouteContext } from "@tanstack/react-router";
import { CDragonService } from "dist/assets/index-Bl6OMZKT";
import React from "react";

type Props = {
  match: NonNullable<$GetSummonerActiveMatchType>;
  teamId: number;
};

export const SummonerLiveTeam = ({ match, teamId }: Props) => {
  const metadata = useLoaderData({ from: "/lol" });
  const { summoner } = useRouteContext({ from: "/lol/summoner/$riotID/live" });

  const participants = match.participants.filter((p) => p.teamId === teamId);

  return (
    <div
      className={cn(
        "flex flex-col w-1/2 gap-1.5 group justify-between",
        teamId === 100 ? "bg-red-500/30" : "bg-blue-500/30",
      )}
    >
      {participants.map((p) => {
        const championName = metadata.champions[p.championId]!.name;
        const championImageUrl = CDragonService.getChampionSquare(p.championId);

        return (
          <div
            key={p.puuid}
            className={cn(
              "flex justify-between bg-neutral-950/30 items-center",
              "group-last:flex-row-reverse group-last:pl-5",
              "group-first:flex-row group-first:pr-5",
            )}
          >
            <div className={"flex group-last:flex-row-reverse gap-2.5"}>
              <div
                className={"w-24 aspect-square rounded-md border"}
                style={{
                  backgroundImage: `url(${championImageUrl})`,
                  backgroundSize: "110%",
                  backgroundPosition: "center",
                }}
              />
              <div className={"flex flex-col justify-center group-last:items-end"}>
                <div className={cn("", p.summoner.puuid === summoner.puuid ? "text-main" : "")}>
                  {championName}
                </div>
                <div
                  className={cn(
                    "text-muted-foreground flex flex-row items-center gap-2.5",
                    "group-last:flex-row-reverse",
                  )}
                >
                  <Link
                    to={"/lol/summoner/$riotID/matches"}
                    params={{ riotID: p.summoner.displayRiotId }}
                    search={{ q: "solo" }}
                  >
                    {p.summoner.displayRiotId}
                  </Link>
                  <div className={"text-tiny"}>{`(lvl ${p.summoner.summonerLevel})`}</div>
                </div>
              </div>
            </div>
            {p.stats?.league ? (
              <React.Fragment>
                <div>{`${p.stats.league.tier} ${p.stats.league.rank} ${p.stats.league.leaguePoints}LP`}</div>
                <div>
                  <div>{`${((p.stats.league.wins / (p.stats.league.wins + p.stats.league.losses)) * 100).toFixed(0)}% WR`}</div>
                  <div
                    className={"text-tiny text-muted-foreground"}
                  >{`${p.stats.league.wins + p.stats.league.losses} matches`}</div>
                </div>
              </React.Fragment>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
