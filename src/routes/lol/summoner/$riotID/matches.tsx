import { createFileRoute } from "@tanstack/react-router";
import { SummonerSidebar } from "@/client/components/summoner/sidebar/SummonerSidebar";
import * as v from "valibot";
import { SummonerFilters } from "@/client/components/summoner/sidebar/filters/SummonerFilters";

import { LolPositions } from "@puuid/core/shared";
import { MatchList } from "@/client/components/summoner/matches/match-list/MatchList";
import { MatchListPagination } from "@/client/components/summoner/matches/match-list/MatchListPagination";

export const Route = createFileRoute("/lol/summoner/$riotID/matches")({
  component: RouteComponent,
  validateSearch: (data) =>
    v.parse(
      v.object({
        /**
         * Global Filter
         */
        c: v.pipe(
          v.exactOptional(v.string()),
          v.transform((s) => s || undefined),
        ),
        /**
         * Game result filter
         */
        w: v.exactOptional(v.boolean()),
        /**
         * Played Champion Filter
         */
        pc: v.exactOptional(
          v.pipe(
            v.array(v.number()),
            v.transform((a) => (a.length ? a : undefined)),
          ),
        ),
        /**
         * Matchup Champion Filter
         */
        mc: v.exactOptional(
          v.pipe(
            v.array(v.number()),
            v.transform((a) => (a.length ? a : undefined)),
          ),
        ),
        /**
         * Teammates Filter
         */
        t: v.exactOptional(
          v.pipe(
            v.array(v.string()),
            v.transform((a) => (a.length ? a : undefined)),
          ),
        ),
        /**
         * Played against Filter
         */
        pa: v.exactOptional(
          v.pipe(
            v.array(v.string()),
            v.transform((a) => (a.length ? a : undefined)),
          ),
        ),
        /**
         * Page
         */
        p: v.exactOptional(v.pipe(v.number(), v.minValue(1)), 1),
        /**
         * Played Position
         */
        pp: v.exactOptional(v.array(v.picklist(LolPositions))),
      }),
      data,
    ),
  beforeLoad: (ctx) => {
    return {
      search: ctx.search,
    };
  },
});

function RouteComponent() {
  return (
    <div className={"flex gap-5 flex-1"}>
      <SummonerSidebar />
      <div className={"flex flex-1 flex-col gap-5 pb-5"}>
        <SummonerFilters />
        <MatchList />
        <MatchListPagination />
      </div>
    </div>
  );
}
