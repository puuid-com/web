import { SummonerSidebarStats } from "@/client/components/summoner/sidebar/SummonerSidebarStats";
import { SummonerSidebarStatsHeader } from "@/client/components/summoner/sidebar/SummonerSidebarStatsHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { DDragonService } from "@/client/services/DDragon";
import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";
import type { StatsByChampionId } from "@/server/db/schema";
import {
  useLoaderData,
  useNavigate,
  useParams,
  useSearch,
} from "@tanstack/react-router";
import { usePageInView } from "framer-motion";
import { SlidersHorizontal, type LucideIcon } from "lucide-react";

const QueueLables = ["Ranked Solo Duo", "Ranked Flex"] as const;
type QueueLabelType = (typeof QueueLables)[number];

const map: Record<QueueLabelType, LolQueueType> = {
  "Ranked Flex": "RANKED_FLEX_SR",
  "Ranked Solo Duo": "RANKED_SOLO_5x5",
};

type Props = {};

export const SummonerSidebarFilters = ({}: Props) => {
  const metadata = useLoaderData({ from: "/lol" });
  const seatch = useSearch({ from: "/lol/summoner/$riotID" });
  const params = useParams({ from: "/lol/summoner/$riotID" });
  const navigation = useNavigate();

  return (
    <SummonerSidebarStats>
      <SummonerSidebarStatsHeader iconName={SlidersHorizontal}>
        Filters
      </SummonerSidebarStatsHeader>

      <div className={"flex gap-2.5 items-center justify-between px-2 py-1"}>
        <div className={"flex gap-1 items-center"}>
          <div className={"flex gap-2.5 items-center"}>
            <label htmlFor="">Queue</label>
            <Select
              value={seatch.queue}
              onValueChange={(v: LolQueueType) => {
                navigation({
                  to: "/lol/summoner/$riotID",
                  params: params,
                  search: {
                    queue: v,
                  },
                });
              }}
            >
              <SelectTrigger className="">
                <SelectValue placeholder="Theme" />
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
        </div>
        <div className={"leading-none text-end"}></div>
      </div>
    </SummonerSidebarStats>
  );
};
