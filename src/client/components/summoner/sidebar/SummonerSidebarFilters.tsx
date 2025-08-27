import { SummonerSidebarStats } from "@/client/components/summoner/sidebar/SummonerSidebarStats";
import { SummonerSidebarStatsHeader } from "@/client/components/summoner/sidebar/SummonerSidebarStatsHeader";
import { Input } from "@/client/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { debounce } from "@tanstack/pacer";
import React from "react";
import type { FriendlyQueueType } from "@/client/lib/typeHelper";

const QueueLables = ["Ranked Solo Duo", "Ranked Flex"] as const;
type QueueLabelType = (typeof QueueLables)[number];

const map: Record<QueueLabelType, FriendlyQueueType> = {
  "Ranked Flex": "flex",
  "Ranked Solo Duo": "solo",
};

const WinsLabels = ["Wins", "Loses", "All"];
type WinsLabelType = (typeof WinsLabels)[number];

interface Props {}

export const SummonerSidebarFilters = ({}: Props) => {
  const search = useSearch({ from: "/lol/summoner/$riotID/matches" });
  const params = useParams({ from: "/lol/summoner/$riotID" });
  const navigation = useNavigate({ from: "/lol/summoner/$riotID/matches" });

  const [searchValue, setSearchValue] = React.useState<string>(search.c ?? "");

  React.useEffect(() => {
    if (search.c) return;

    /**
     * If the search param has been clear by a navigation
     */
    setSearchValue(search.c ?? "");
  }, [search.c]);

  const debouncedSearch = debounce(
    (value: string) =>
      navigation({
        search: (s) => ({
          ...s,
          c: value,
        }),
        replace: true,
      }),
    {
      wait: 500, // Wait 500ms after last keystroke
    },
  );

  const parsedWinsParam: WinsLabelType =
    search.w === true ? "Wins" : search.w === false ? "Loses" : "All";

  const handleChampionSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setSearchValue(value);
    debouncedSearch(value);
  };

  return (
    <SummonerSidebarStats>
      <SummonerSidebarStatsHeader iconName={SlidersHorizontal}>Filters</SummonerSidebarStatsHeader>
      <div className={"flex items-center justify-between p-2.5"}>
        <div className={"flex gap-2.5 flex-1 flex-col"}>
          <div className={"flex items-center justify-between flex-1 gap-5"}>
            <label htmlFor="">Queue</label>
            <Select
              value={search.q}
              onValueChange={(v: FriendlyQueueType) => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                navigation({
                  to: "/lol/summoner/$riotID/matches",
                  params: params,
                  search: (s) => ({
                    ...s,
                    q: v,
                  }),
                });
              }}
            >
              <SelectTrigger className="w-3/5">
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
          <div className={"flex items-center justify-between flex-1 gap-5"}>
            <label htmlFor="">Champion</label>
            <Input className={"w-3/5"} value={searchValue} onChange={handleChampionSearch} />
          </div>
          <div className={"flex items-center justify-between flex-1 gap-5"}>
            <label htmlFor="">Result</label>
            <Select
              value={parsedWinsParam}
              onValueChange={(v: WinsLabelType) => {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                navigation({
                  to: "/lol/summoner/$riotID/matches",
                  params: params,
                  search: (s) => ({
                    ...s,
                    w: v === "All" ? undefined : v === "Wins" ? true : false,
                  }),
                });
              }}
            >
              <SelectTrigger className="w-3/5">
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
        <div className={"leading-none text-end"}></div>
      </div>
    </SummonerSidebarStats>
  );
};
