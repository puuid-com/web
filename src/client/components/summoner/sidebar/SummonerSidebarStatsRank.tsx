import { SummonerSidebarRankHistoryChart } from "@/client/components/summoner/sidebar/SummonerSidebarRankHistoryChart";
import { SummonerSidebarStats } from "@/client/components/summoner/sidebar/SummonerSidebarStats";
import { SummonerSidebarStatsHeader } from "@/client/components/summoner/sidebar/SummonerSidebarStatsHeader";
import { CDNService } from "@/shared/services/CDNService";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import { TrophyIcon } from "lucide-react";

type Props = {};

export const SummonerSidebarStatsRank = ({}: Props) => {
  const { queueStats, summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const q = useSearch({
    from: "/lol/summoner/$riotID/matches",
    select: (s) => s.q,
  });

  const league = queueStats?.league;
  const winrate = league ? (league.wins / (league.losses + league.wins)) * 100 : 0;
  const leagues = queueStats
    ? summoner.leagues.filter((l) => l.queueType === queueStats.queueType)
    : [];

  return (
    <SummonerSidebarStats>
      <SummonerSidebarStatsHeader iconName={TrophyIcon}>
        {`Stats (${q})`}
      </SummonerSidebarStatsHeader>
      {queueStats && league ? (
        <div className="px-1.5 py-1 flex flex-col gap-2">
          <div className="flex gap-1.5 items-center justify-between">
            <div>
              <img className="w-16" src={CDNService.getTierImageUrl(league.tier)} alt="" />
            </div>
            <div className="flex flex-col leading-none text-right">
              <div className="flex flex-row gap-1.5 justify-end">
                <span>{league.tier}</span>
                <span>{league.rank}</span>
                <span>{league.leaguePoints} LP</span>
              </div>
              <div className="text-xs flex gap-1 justify-end">
                <div>
                  <span className="font-bold">{league.wins}</span>
                  <span>W</span>
                </div>
                <span>—</span>
                <div>
                  <span className="font-bold">{league.losses}</span>
                  <span>L</span>
                </div>
                <div>
                  <span>({winrate.toFixed(0)}%)</span>
                </div>
              </div>
            </div>
          </div>
          <SummonerSidebarRankHistoryChart leagues={leagues} />
        </div>
      ) : (
        <div className="text-muted-foreground w-full text-center p-1.5">No data</div>
      )}
    </SummonerSidebarStats>
  );
};
