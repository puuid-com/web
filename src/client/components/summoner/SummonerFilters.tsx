import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { useSummonerFilter } from "@/client/hooks/useSummonerFilter";
import type { FriendlyQueueType } from "@/client/lib/typeHelper";
import { cn } from "@/client/lib/utils";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import { ChevronUpIcon, SearchIcon, XIcon } from "lucide-react";
import React, { type ChangeEvent } from "react";

type Props = {};

const MAX_FILTER_DISPLAYED_COUNT = 2;

const QueueLables = ["Ranked Solo Duo", "Ranked Flex"] as const;
type QueueLabelType = (typeof QueueLables)[number];

const map: Record<QueueLabelType, FriendlyQueueType> = {
  "Ranked Flex": "flex",
  "Ranked Solo Duo": "solo",
};

const WinsLabels = ["Wins", "Loses", "All"];
type WinsLabelType = (typeof WinsLabels)[number];

export const SummonerFilters = ({}: Props) => {
  const metadata = useLoaderData({ from: "/lol" });
  const navigate = useNavigate({ from: "/lol/summoner/$riotID/matches" });
  const c = useSearch({ from: "/lol/summoner/$riotID/matches", select: (s) => s.c });
  const q = useSearch({ from: "/lol/summoner/$riotID/matches", select: (s) => s.q });
  const w = useSearch({ from: "/lol/summoner/$riotID/matches", select: (s) => s.w });
  const pc = useSearch({ from: "/lol/summoner/$riotID/matches", select: (s) => s.pc });
  const mc = useSearch({ from: "/lol/summoner/$riotID/matches", select: (s) => s.mc });
  const [open, setOpen] = React.useState(false);
  const { handleFilterChanges: handlePCFilterChanges } = useSummonerFilter("pc");
  const { handleFilterChanges: handleMCFilterChanges } = useSummonerFilter("mc");

  const toggleOpen = () => {
    setOpen((o) => !o);
  };

  const parsedWinsParam: WinsLabelType = w === true ? "Wins" : w === false ? "Loses" : "All";

  const handleMainFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    navigate({
      to: ".",
      search: (s) => ({
        ...s,
        c: e.currentTarget.value,
      }),
    }).catch(console.error);
  };

  const handleQueueFilterChance = (v: FriendlyQueueType) => {
    navigate({
      to: ".",
      search: (s) => ({
        ...s,
        q: v,
      }),
    }).catch(console.error);
  };

  const handleResultFilterChance = (v: WinsLabelType) => {
    navigate({
      to: ".",
      search: (s) => ({
        ...s,
        w: v === "All" ? undefined : v === "Wins" ? true : false,
      }),
    }).catch(console.error);
  };

  const pcValues = React.useMemo(() => {
    return (pc ?? []).map((championId) => {
      return {
        id: championId,
        name: DDragonService.getChampionName(metadata.champions, championId),
        imageUrl: CDragonService.getChampionSquare(championId),
      };
    });
  }, [metadata.champions, pc]);

  const mcValues = React.useMemo(() => {
    return (mc ?? []).map((championId) => {
      return {
        id: championId,
        name: DDragonService.getChampionName(metadata.champions, championId),
        imageUrl: CDragonService.getChampionSquare(championId),
      };
    });
  }, [mc, metadata.champions]);

  return (
    <div
      className={cn(
        "border-main/10 bg-main/5 border-1 w-full rounded-md flex items-center transition-[height] flex-col",
      )}
    >
      <div className={"flex flex-row justify-between items-center w-full p-2.5"}>
        <div className={"flex gap-2 w-60 h-full relative"}>
          <Input
            className={"w-full h-full pl-5.5"}
            onChange={handleMainFilterChange}
            value={c ?? ""}
            placeholder={"Champion, Summoner, etc."}
          />
          <SearchIcon
            className={"absolute left-1.5 w-3 text-muted-foreground top-1/2 -translate-y-1/2"}
          />
        </div>
        <div className={"flex gap-2.5 items-center"}>
          <div className={"flex gap-1 items-center border px-1.5 py-1 rounded-md"}>
            <div className={"text-xs"}>Played Champions {`>`}</div>
            <div className={"flex gap-1"}>
              {pcValues.slice(0, MAX_FILTER_DISPLAYED_COUNT).map((c) => (
                <button
                  className={
                    "relative group flex gap-1 items-center justify-between bg-main/10 px-1 py-0.5 rounded-md hover:opacity-45 hover:cursor-pointer"
                  }
                  onClick={() => {
                    handlePCFilterChanges(c.id, true);
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
              {pcValues.length > MAX_FILTER_DISPLAYED_COUNT ? <div>{"..."}</div> : null}
            </div>
          </div>
          <div className={"flex gap-1 items-center border px-1.5 py-1 rounded-md"}>
            <div className={"text-xs"}>Matchup Champions {`>`}</div>
            <div className={"flex gap-1"}>
              {mcValues.slice(0, MAX_FILTER_DISPLAYED_COUNT).map((c) => (
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
              {mcValues.length > MAX_FILTER_DISPLAYED_COUNT ? <div>{"..."}</div> : null}
            </div>
          </div>
        </div>
        <Button variant={"main"} size={"sm"} onClick={toggleOpen} className={""}>
          <ChevronUpIcon className={cn("transition-transform", open ? "" : "rotate-180")} />
          Filters
        </Button>
      </div>
      <div
        className={cn(
          "transition-[height] flex items-center justify-center bg-red-600/10 w-full h-full",
          open ? "h-24" : "h-0 invisible",
        )}
      >
        <div>
          <Select value={q} onValueChange={handleQueueFilterChance}>
            <SelectTrigger className="">
              <SelectValue placeholder="Theme" className={" "} />
            </SelectTrigger>
            <SelectContent>
              {QueueLables.map((q) => (
                <SelectItem key={q} value={map[q]}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select value={parsedWinsParam} onValueChange={handleResultFilterChance}>
            <SelectTrigger className="">
              <SelectValue placeholder="Theme" className={" "} />
            </SelectTrigger>
            <SelectContent>
              {WinsLabels.map((q) => (
                <SelectItem key={q} value={q}>
                  {q}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
