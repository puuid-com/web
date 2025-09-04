import { MatchCommentDialog } from "@/client/components/match-list/comments/MatchCommentDialog";
import { useMatchContext } from "@/client/context/MatchContext";
import { useMatchComments } from "@/client/hooks/useMatchComments";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { useLoaderData } from "@tanstack/react-router";

type Props = {};

export const MatchCommentsSection = ({}: Props) => {
  const metadata = useLoaderData({ from: "/lol" });
  const { data, status } = useMatchComments();
  const { match } = useMatchContext();

  if (status !== "success") {
    return null;
  }

  return (
    <div>
      <ul className={"flex flex-col gap-1"}>
        {data.map((c) => {
          const summoner = match.summoners.find((s) => s.puuid === c.puuid)!;
          const championName = DDragonService.getChampionName(
            metadata.champions,
            summoner.championId,
          );
          const championIconUrl = CDragonService.getChampionSquare(summoner.championId);

          return (
            <li key={c.id} className={"flex flex-row"}>
              <div>
                <img src={championIconUrl} alt="" className={"w-12 rounded-full"} />
              </div>
              <div>
                <div className={"flex gap-2.5 items-center"}>
                  <div className={"font-bold"}>{championName}</div>
                  <div className={"text-xs text-muted-foreground"}>
                    <span>@</span>
                    <span>{summoner.gameName}</span>
                    <span>{`#${summoner.tagLine}`}</span>
                  </div>
                </div>
                <div className={"text-sm"}>{c.text}</div>
              </div>
            </li>
          );
        })}
      </ul>
      <div>
        <MatchCommentDialog />
      </div>
    </div>
  );
};
