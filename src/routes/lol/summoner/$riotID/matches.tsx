import { createFileRoute } from "@tanstack/react-router";
import { MatchList } from "@/client/components/match-list/MatchList";
import { SummonerSidebar } from "@/client/components/summoner/sidebar/SummonerSidebar";
import * as v from "valibot";
import { SummonerFilters } from "@/client/components/summoner/sidebar/filters/SummonerFilters";

import { MatchListPagination } from "@/client/components/match-list/MatchListPagination";

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
        p: v.exactOptional(v.pipe(v.number(), v.minValue(1)), 1),
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
