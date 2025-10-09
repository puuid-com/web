import { useLoaderData } from "@tanstack/react-router";

type Props = {};

export const MatchesSummary = ({}: Props) => {
  const { queueStats } = useLoaderData({
    from: "/lol/summoner/$riotID",
  });

  const stats = queueStats?.recentSummonerStatistic;

  if (!stats) return null;

  return (
    <div>
      <h1>MatchesSummary</h1>
    </div>
  );
};
