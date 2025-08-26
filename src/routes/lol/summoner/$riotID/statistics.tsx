import { Input } from "@/client/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { useGetSummonerStatistics } from "@/client/queries/getSummonerStatistics";
import {
  FriendlyQueueTypes,
  friendlyQueueTypeToRiot,
  type FriendlyQueueType,
} from "@/client/lib/typeHelper";
import {
  individualPositions,
  type IndividualPositionType,
} from "@/server/api-route/riot/match/MatchDTO";
import {
  createFileRoute,
  useLoaderData,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import React from "react";
import * as v from "valibot";

export const Route = createFileRoute("/lol/summoner/$riotID/statistics")({
  component: RouteComponent,
  validateSearch: (raw) =>
    v.parse(
      v.object({
        queue: v.exactOptional(v.picklist(FriendlyQueueTypes), "solo"),
        champion: v.pipe(
          v.exactOptional(v.string()),
          v.transform((s) => s || undefined),
        ),
        position: v.exactOptional(v.picklist(individualPositions)),
      }),
      raw,
    ),
});

function RouteComponent() {
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const metadata = useLoaderData({ from: "/lol" });
  const search = useSearch({ from: "/lol/summoner/$riotID/statistics" });
  const params = useParams({ from: "/lol/summoner/$riotID" });
  const navigate = useNavigate({ from: "/lol/summoner/$riotID/statistics" });

  const { data, isPending, isError } = useGetSummonerStatistics({
    summoner,
  });

  const queueStat = React.useMemo(() => {
    if (!data) return null;
    return data.find((s) => s.queueType === friendlyQueueTypeToRiot(search.queue));
  }, [data, search.queue]);

  const championStats = React.useMemo(() => {
    if (!queueStat) return [];
    let list = queueStat.statsByChampionId;
    if (search.champion) {
      list = list.filter((c) => {
        const name = metadata.champions[c.championId]?.name ?? "";
        return name.toLowerCase().includes(search.champion!.toLowerCase());
      });
    }
    return list;
  }, [queueStat, search.champion, metadata.champions]);

  const positionStats = React.useMemo(() => {
    if (!queueStat) return [];
    let list = queueStat.statsByIndividualPosition;
    if (search.position) {
      list = list.filter((p) => p.individualPosition === search.position);
    }
    return list;
  }, [queueStat, search.position]);

  if (isPending) return <div>Loading...</div>;
  if (isError || !queueStat) return <div>Error loading statistics</div>;

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label>Queue</label>
          <Select
            value={search.queue}
            onValueChange={(v: FriendlyQueueType) => {
              navigate({
                to: "/lol/summoner/$riotID/statistics",
                params,
                search: (s) => ({ ...s, queue: v }),
              }).catch(console.error);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solo">Ranked Solo Duo</SelectItem>
              <SelectItem value="flex">Ranked Flex</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label>Champion</label>
          <Input
            className="w-40"
            value={search.champion ?? ""}
            onChange={(e) => {
              navigate({
                to: "/lol/summoner/$riotID/statistics",
                params,
                replace: true,
                search: (s) => ({
                  ...s,
                  champion: e.currentTarget.value || undefined,
                }),
              }).catch(console.error);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label>Position</label>
          <Select
            value={search.position ?? ""}
            onValueChange={(v: IndividualPositionType) => {
              navigate({
                to: "/lol/summoner/$riotID/statistics",
                params,
                search: (s) => ({
                  ...s,
                  position: v === "Invalid" ? undefined : v,
                }),
              }).catch(console.error);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Invalid">All</SelectItem>
              {individualPositions.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <h2 className="font-semibold">Stats by Champion</h2>
        <ul className="list-disc pl-4">
          {championStats.map((c) => (
            <li key={c.championId}>
              {metadata.champions[c.championId]?.name ?? c.championId}: {c.wins}W {c.losses}L
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="font-semibold">Stats by Position</h2>
        <ul className="list-disc pl-4">
          {positionStats.map((p) => (
            <li key={p.individualPosition}>
              {p.individualPosition}: {p.wins}W {p.losses}L
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
