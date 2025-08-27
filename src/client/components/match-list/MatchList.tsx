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
  const { q, c, w } = useSearch({
    from: "/lol/summoner/$riotID/matches",
  });
  const params = useParams({ from: "/lol/summoner/$riotID/matches" });

  const q_matches = useGetSummonerMatches(
    {
      queue: q,
      summoner: summoner,
    },
    (c ?? "").toUpperCase(),
    w,
  );

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

  if (!q_matches.data.length) {
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
      <MatchListContent matches={q_matches.data} summoner={summoner} />
    </React.Fragment>
  );
};
