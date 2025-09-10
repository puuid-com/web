import { SummonerChampionFilterGroup } from "@/client/components/summoner/sidebar/filters/SummonerChampionFilterGroup";
import { SummonerSummonerFilterGroup } from "@/client/components/summoner/sidebar/filters/SummonerSummonerFilterGroup";
import { Input } from "@/client/components/ui/input";

import { cn } from "@/client/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { CatIcon, HandshakeIcon, RatIcon, SearchIcon } from "lucide-react";
import { type ChangeEvent } from "react";
import { debounce } from "@tanstack/react-pacer";

type Props = {};

export const SummonerFilters = ({}: Props) => {
  const navigate = useNavigate({ from: "/lol/summoner/$riotID/matches" });
  const c = useSearch({ from: "/lol/summoner/$riotID/matches", select: (s) => s.c });

  const handleMainFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    navigate({
      to: ".",
      search: (s) => ({
        ...s,
        c: e.currentTarget.value,
      }),
    }).catch(console.error);
  };

  const debouncedSearch = debounce(
    (e: ChangeEvent<HTMLInputElement>) => {
      handleMainFilterChange(e);
    },
    {
      wait: 500,
    },
  );

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
            onChange={debouncedSearch}
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
      </div>
    </div>
  );
};
