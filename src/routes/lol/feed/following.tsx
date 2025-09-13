import React from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { $getFollowing } from "@/server/functions/$getFollowing";
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { Button } from "@/client/components/ui/button";
import { Separator } from "@/client/components/ui/separator";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { $unfollow } from "@/server/functions/$unfollow";
import { toast } from "sonner";
import { FollowingPost } from "@/client/components/follow/FollowingPost";

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

  // Slightly larger estimate to fit the new post layout
  const ITEM_ESTIMATE = 200;
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
            return (
              <FollowingPost
                key={f.puuid}
                item={f}
                start={vRow.start}
                index={vRow.index}
                measureElement={rowVirtualizer.measureElement}
                onUnfollow={(puuid) => {
                  mUnfollow.mutate(puuid);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
