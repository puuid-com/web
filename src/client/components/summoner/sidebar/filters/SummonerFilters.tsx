import { SummonerChampionFilterGroup } from "@/client/components/summoner/sidebar/filters/SummonerChampionFilterGroup";
import { SummonerSummonerFilterGroup } from "@/client/components/summoner/sidebar/filters/SummonerSummonerFilterGroup";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import type { FriendlyQueueType } from "@/client/lib/typeHelper";
import { cn } from "@/client/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CatIcon, ChevronUpIcon, HandshakeIcon, RatIcon, SearchIcon } from "lucide-react";
import React, { type ChangeEvent } from "react";

type Props = {};

const QueueLables = ["Ranked Solo Duo", "Ranked Flex"] as const;
type QueueLabelType = (typeof QueueLables)[number];

const map: Record<QueueLabelType, FriendlyQueueType> = {
  "Ranked Flex": "flex",
  "Ranked Solo Duo": "solo",
};

const WinsLabels = ["Wins", "Loses", "All"];
type WinsLabelType = (typeof WinsLabels)[number];

export const SummonerFilters = ({}: Props) => {
  const navigate = useNavigate({ from: "/lol/summoner/$riotID/matches" });
  const c = useSearch({ from: "/lol/summoner/$riotID/matches", select: (s) => s.c });
  const q = useSearch({ from: "/lol/summoner/$riotID/matches", select: (s) => s.q });
  const w = useSearch({ from: "/lol/summoner/$riotID/matches", select: (s) => s.w });
  const [open, setOpen] = React.useState(false);

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

  return (
    <div
      className={cn(
        " border-main/10 bg-main/5 border-1 w-full rounded-md flex items-center transition-[height] flex-col",
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
          <SummonerChampionFilterGroup searchKey={"pc"} label={"Played Champions"} icon={CatIcon} />
          <SummonerChampionFilterGroup
            searchKey={"mc"}
            label={"Matchup Champions"}
            icon={RatIcon}
          />
          <SummonerSummonerFilterGroup searchKey={"t"} label={"Teammates"} icon={HandshakeIcon} />
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
