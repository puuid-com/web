import { DDragonService } from "@/client/services/DDragon";
import { $getSummonerByRiotID } from "@/server/functions/$getSummonerByRiotID";
import {
  createFileRoute,
  Link,
  useLoaderData,
  useRouter,
} from "@tanstack/react-router";
import * as v from "valibot";
import { MatchList } from "@/client/components/match-list/MatchList";
import { SummonerStats } from "@/client/components/summoner-stats/SummonerStats";
import { Button } from "@/client/components/ui/button";
import { $postRefreshSummonerData } from "@/server/functions/$postRefreshSummonerData";
import { QueueTypes } from "@/server/api-route/riot/league/LeagueDTO";
import { toast } from "sonner";
import { Badge } from "@/client/components/ui/badge";
import { timeago } from "@/client/lib/utils";
import { SimpleProgressDialog } from "@/client/components/SimpleProgressViewer";
import React from "react";

export const Route = createFileRoute("/lol/summoner/$riotID/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const { queue } = Route.useSearch();
  const metadata = useLoaderData({ from: "/lol" });

  const [gameName, tagLine] = summoner.riotId.split("#");

  return (
    <div className={"flex flex-col gap-5 container m-10"}>
      <div>
        <div className={"flex items-center gap-2"}>
          <div>
            <img
              src={DDragonService.getProfileIconUrl(
                metadata.latest_version,
                summoner.profileIconId
              )}
              alt=""
              className={"w-16 aspect-square"}
            />
          </div>
          <div>
            <h1 className={"text-3xl"}>
              <span>{gameName}</span>
              <span className={"text-muted italic"}>#{tagLine}</span>
            </h1>
            <div>
              <Link
                to={"/lol/summoner/$riotID/refresh"}
                params={{
                  riotID: summoner.riotId,
                }}
                search={{
                  queue: queue,
                }}
              >
                Refresh Summoner
              </Link>
              <Badge variant={"secondary"}>
                Last refresh : {timeago(summoner.refreshedAt)}
              </Badge>
            </div>
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
      <div>
        <SummonerStats queue={queue} summoner={summoner} />
      </div>
      <div>
        <div>
          <h1>Matches</h1>
        </div>
        <div>
          <MatchList queue={queue} summoner={summoner} />
        </div>
        <div>
          {/* <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  disabled={matches.previousPage === null}
                  onClick={() =>
                    navigate({
                      to: ".",
                      search: (s) => ({ ...s, page: matches.previousPage! }),
                    })
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink disabled>{matches.currentPage}</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  disabled={matches.nextPage === null}
                  onClick={() =>
                    navigate({
                      to: ".",
                      search: (s) => ({ ...s, page: matches.nextPage! }),
                    })
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination> */}
        </div>
      </div>
    </div>
  );
}
