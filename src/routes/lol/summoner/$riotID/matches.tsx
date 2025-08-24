import { createFileRoute } from "@tanstack/react-router";
import { MatchList } from "@/client/components/match-list/MatchList";
import { SummonerSidebar } from "@/client/components/summoner/sidebar/SummonerSidebar";
import * as v from "valibot";
import { FriendlyQueueTypes } from "@/client/lib/typeHelper";

export const Route = createFileRoute("/lol/summoner/$riotID/matches")({
  component: RouteComponent,
  validateSearch: (data) =>
    v.parse(
      v.object({
        q: v.exactOptional(v.picklist(FriendlyQueueTypes), "solo"),
        c: v.pipe(
          v.exactOptional(v.string()),
          v.transform((s) => s || undefined),
        ),
        w: v.exactOptional(v.boolean()),
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
    <div className={"flex gap-10 flex-1"}>
      <SummonerSidebar />
      <div className={"flex flex-1"}>
        <MatchList />
      </div>
    </div>
  );
}
