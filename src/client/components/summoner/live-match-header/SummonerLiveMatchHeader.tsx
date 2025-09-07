import { SummonerLiveMatchHeaderTeam } from "@/client/components/summoner/live-match-header/SummonerLiveMatchHeaderTeam";
import { Skeleton } from "@/client/components/ui/skeleton";
import { useSummonerLiveMatch } from "@/client/hooks/useSummonerLiveMatch";
import { formatSeconds } from "@/client/lib/utils";
import { getQueueById } from "@/server/services/match/queues.type";
import React from "react";

type Props = {};

const getSecSinceStart = (start: number) => Math.floor((Date.now() - start) / 1000);

export const SummonerLiveMatchHeader = ({}: Props) => {
  const mounted = React.useRef(false);
  const [matchSecSinceStartTimer, setMatchSecSinceStartTimer] = React.useState(0);
  const { data, status } = useSummonerLiveMatch();

  React.useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
    }
  }, []);

  React.useEffect(() => {
    if (status !== "success" || !data) return;

    const interval = setInterval(() => {
      setMatchSecSinceStartTimer(getSecSinceStart(data.gameStartTime));
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [data, status]);

  if (status !== "success" || !data) return null;

  const queue = getQueueById(data.gameQueueConfigId);

  if (!queue) return null;

  return (
    <div className={"group bg-main/30 rounded-md flex justify-between p-1.5"}>
      <SummonerLiveMatchHeaderTeam match={data} teamId={100} />
      <div className={"flex flex-col items-center justify-center"}>
        <div className={"flex gap-2.5"}>
          <div>Live Match</div>
          <div>{queue.description}</div>
        </div>
        <div>
          {matchSecSinceStartTimer !== 0 ? (
            formatSeconds(matchSecSinceStartTimer)
          ) : (
            <Skeleton>
              <span className={"invisible select-none"}>20sec</span>
            </Skeleton>
          )}
        </div>
      </div>
      <SummonerLiveMatchHeaderTeam match={data} teamId={200} />
    </div>
  );
};
