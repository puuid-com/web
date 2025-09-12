import React from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { $getFollowing } from "@/server/functions/$getFollowing";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { Button } from "@/client/components/ui/button";
import { Badge } from "@/client/components/ui/badge";
import { Separator } from "@/client/components/ui/separator";
import { ExternalLink, BrainIcon, RatIcon, NotebookPenIcon } from "lucide-react";
import { timeago } from "@/client/lib/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { $unfollow } from "@/server/functions/$unfollow";
import { toast } from "sonner";
import { MainChampionProvider } from "@/client/context/MainChampionContext";

export const Route = createFileRoute("/lol/feed/following")({
  component: RouteComponent,
  loader: async () => {
    const following = await $getFollowing();

    return { following };
  },
});

function RouteComponent() {
  const { following } = Route.useLoaderData();
  const router = useRouter();

  const $m_unfollow = useServerFn($unfollow);
  const mUnfollow = useMutation({
    mutationFn: async (puuid: string) => $m_unfollow({ data: { puuid } }),
    onSuccess: async () => {
      toast.success("Unfollowed");
      await router.invalidate();
    },
  });

  const [query, setQuery] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return following;
    return following.filter((f) =>
      [
        f.summoner.displayRiotId.toLowerCase(),
        f.summoner.region.toLowerCase(),
        ...f.summoner.notes.map((n) => n.note.toLowerCase()),
      ].some((v) => v.includes(q)),
    );
  }, [following, query]);

  const ITEM_ESTIMATE = 112;
  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => document.querySelector("#body-content"),
    estimateSize: () => ITEM_ESTIMATE,
    overscan: 8,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-end gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Following</h1>
          <p className="text-sm text-neutral-400">Players you follow across regions.</p>
        </div>
        <div className="ml-auto flex w-full max-w-md items-center gap-2">
          <Input
            placeholder="Search by Riot ID or region"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
          />
        </div>
      </div>

      <Separator />

      {!filtered.length ? (
        <Card className="border-neutral-800/60">
          <CardHeader>
            <CardTitle className="text-base">No follows yet</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-neutral-400">
            You aren't following anyone. Explore featured games or search for a player to follow.
            <div className="mt-3 flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/lol/featured-games/$region" params={{ region: "euw1" }}>
                  Featured games
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link to="/">Search players</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="relative w-full" style={{ height: rowVirtualizer.getTotalSize() }}>
          {rowVirtualizer.getVirtualItems().map((vRow) => {
            const f = filtered[vRow.index]!;
            const summoner = f.summoner;
            const [gameName, tagLine] = summoner.displayRiotId.split("#");
            const note = summoner.notes.at(0);
            const stats =
              summoner.statistics.find((s) => s.queueType === "RANKED_SOLO_5x5") ??
              summoner.statistics.find((s) => s.queueType === "RANKED_FLEX_SR");

            const lastMatchSummoner = summoner.matchSummoner.at(0);
            const lastMatch = lastMatchSummoner ? lastMatchSummoner.match : undefined;

            return (
              <MainChampionProvider statistic={stats ?? null} key={f.puuid}>
                <div
                  ref={rowVirtualizer.measureElement}
                  className="absolute left-0 top-0 w-full p-1.5"
                  style={{ transform: `translateY(${String(vRow.start)}px)` }}
                >
                  <div className="bg-cover flex items-center justify-between gap-4 rounded-md border p-3 bg-main/10 ring ring-main">
                    <div className="flex items-center gap-3">
                      <img
                        className="w-12 h-12 rounded-md border"
                        src={CDragonService.getProfileIcon(summoner.profileIconId)}
                        alt="profile icon"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{gameName}</h3>
                          <span className="text-muted-foreground">#{tagLine}</span>
                          <Badge variant="secondary" className="text-xs">
                            Lv. {summoner.summonerLevel}
                          </Badge>
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="gap-1 uppercase text-[10px]">
                            {summoner.region}
                          </Badge>
                          <Badge variant="outline" className="gap-1">
                            {summoner.isMain ? (
                              <>
                                <BrainIcon className="w-3 h-3" /> Main
                              </>
                            ) : (
                              <>
                                <RatIcon className="w-3 h-3" /> Smurf
                              </>
                            )}
                          </Badge>
                          {note ? (
                            <Badge>
                              <NotebookPenIcon /> {note.note}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          to={"/lol/summoner/$riotID/matches"}
                          params={{ riotID: summoner.riotId.replace("#", "-") }}
                          search={{ q: "solo" }}
                          target="_blank"
                        >
                          <ExternalLink className="w-4 h-4" /> Go to page
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          mUnfollow.mutate(summoner.puuid);
                        }}
                      >
                        Unfollow
                      </Button>
                      <div className="ml-2 text-xs text-neutral-500">
                        Followed {timeago(f.createdAt)} ago
                      </div>
                    </div>
                  </div>
                  <div>{lastMatch?.matchId}</div>
                </div>
              </MainChampionProvider>
            );
          })}
        </div>
      )}
    </div>
  );
}
