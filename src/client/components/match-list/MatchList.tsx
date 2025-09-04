import React from "react";
import { useGetSummonerMatches } from "@/client/queries/getSummonerMatches";
import { MatchListContent } from "@/client/components/match-list/MatchListContent";
import LoadingScreen from "@/client/components/Loading";
import { Link, useLoaderData, useParams, useSearch } from "@tanstack/react-router";
import { CompassIcon } from "lucide-react";
import { Button } from "@/client/components/ui/button";

type Props = {};

export const MatchList = ({}: Props) => {
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const metadata = useLoaderData({ from: "/lol" });
  const { q, c, w, mc, pc, t } = useSearch({
    from: "/lol/summoner/$riotID/matches",
  });
  const params = useParams({ from: "/lol/summoner/$riotID/matches" });

  const q_matches = useGetSummonerMatches({
    queue: q,
    summoner: summoner,
  });

  const champions = metadata.champions;

  const filteredMatches = React.useMemo(() => {
    if (q_matches.status !== "success") return [];

    const stringFilter = (c ?? "").toUpperCase();

    return q_matches.data.matches.filter((m) => {
      const pageParticipant = m.summoners.find((s) => s.puuid === summoner.puuid)!;
      const vsParticipant = m.summoners.find((s) => s.puuid === pageParticipant.vsSummonerPuuid)!;
      const championName = champions[pageParticipant.championId]!.name.toUpperCase();

      const cCheck = !c || championName.startsWith(stringFilter);
      if (!cCheck) return false;

      const wCheck = w === undefined || pageParticipant.win === w;
      if (!wCheck) return false;

      const mcCheck = mc === undefined || mc.includes(vsParticipant.championId);
      if (!mcCheck) return false;

      const pcCheck = pc === undefined || pc.includes(pageParticipant.championId);
      if (!pcCheck) return false;

      const tCheck =
        t === undefined ||
        m.summoners.find((s) => {
          if (s.puuid === pageParticipant.puuid) return false;

          return s.puuid !== pageParticipant.puuid && t.includes(s.puuid);
        });
      if (!tCheck) return false;

      return true;
    });
  }, [c, champions, mc, pc, q_matches.data?.matches, q_matches.status, summoner.puuid, t, w]);

  if (q_matches.status === "pending") {
    return <LoadingScreen />;
  } else if (q_matches.status === "error") {
    return (
      <div>
        <h1>Error :/</h1>
        <p>{q_matches.error.message}</p>
      </div>
    );
  }

  if (!filteredMatches.length) {
    return (
      <div className={"flex flex-1 justify-start items-center text-3xl text-neutral-900 flex-col"}>
        <div className={"flex justify-between items-center gap-1.5"}>
          <CompassIcon />
          No matched found
        </div>
        {c ? (
          <Button asChild variant={"secondary"}>
            <Link
              to={"/lol/summoner/$riotID/matches"}
              params={params}
              search={{
                q: q,
              }}
              className={"text-xl opacity-50"}
            >
              Clear filters
            </Link>
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <React.Fragment>
      <MatchListContent matches={filteredMatches} summoner={summoner} />
    </React.Fragment>
  );
};
