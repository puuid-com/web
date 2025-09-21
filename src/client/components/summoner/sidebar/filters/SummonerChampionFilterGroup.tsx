import { Badge } from "@/client/components/ui/badge";
import { useSummonerFilter, type MatchesSearchKey } from "@/client/hooks/useSummonerFilter";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import { XIcon, type LucideIcon } from "lucide-react";
import React from "react";

type Props = {
  searchKey: MatchesSearchKey<number>;
  label: string;
  icon: LucideIcon;
};

const MAX_FILTER_DISPLAYED_COUNT = 3;

export const SummonerChampionFilterGroup = ({ searchKey, icon: Icon, label }: Props) => {
  const metadata = useLoaderData({ from: "__root__" });
  const searchValue = useSearch({
    from: "/lol/summoner/$riotID/matches",
    select: (s) => s[searchKey],
  });
  const { handleFilterChanges: handleMCFilterChanges } = useSummonerFilter(searchKey);

  const values = React.useMemo(() => {
    return (searchValue ?? []).map((value) => {
      return {
        id: value,
        name: DDragonService.getChampionName(metadata.champions, value),
        imageUrl: CDragonService.getChampionSquare(value),
      };
    });
  }, [metadata.champions, searchValue]);

  return (
    <div
      className={
        "flex gap-1 items-center border px-1.5 py-1 rounded-md hover:bg-main/20 transition-colors duration-200 hover:cursor-pointer"
      }
    >
      <div className={"text-xs flex gap-1 items-center font-bold"}>
        <Icon className={"w-3"} />
        {label}
      </div>
      <div className={"flex gap-1"}>
        {values.slice(0, MAX_FILTER_DISPLAYED_COUNT).map((c) => (
          <button
            className={
              "relative group flex gap-1 items-center justify-between bg-main/10 px-1 py-0.5 rounded-md hover:opacity-45 hover:cursor-pointer"
            }
            onClick={() => {
              handleMCFilterChanges(c.id, true);
            }}
          >
            <div
              className={"w-3 h-3 bg-cover rounded-full bg-no-repeat"}
              style={{
                backgroundImage: `url(${c.imageUrl})`,
                backgroundSize: "105%",
              }}
            />
            <div className={"text-xs"}>{c.name}</div>
            <div
              className={
                "absolute flex group-hover:opacity-100 opacity-0 w-full transition-opacity h-full justify-center items-center"
              }
            >
              <XIcon className={"text-main/30"} />
            </div>
          </button>
        ))}
        {values.length > MAX_FILTER_DISPLAYED_COUNT ? <div>{"..."}</div> : null}
        {!values.length ? (
          <Badge variant={"icon"} className={"text-muted-foreground p-1"}>
            No filter
          </Badge>
        ) : null}
      </div>
    </div>
  );
};
