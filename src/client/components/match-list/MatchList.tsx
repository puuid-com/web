import React from "react";
import { MatchListContent } from "@/client/components/match-list/MatchListContent";
import LoadingScreen from "@/client/components/Loading";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import { CompassIcon } from "lucide-react";

import { useGetSummonerMatches } from "@/client/queries/getSummonerMatches";

type Props = {};

export const MatchList = ({}: Props) => {
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const filters = useSearch({
    from: "/lol/summoner/$riotID/matches",
  });

  const { data, status } = useGetSummonerMatches({
    summoner: summoner,
    filters: filters,
  });

  if (status === "pending") {
    return <LoadingScreen />;
  } else if (status === "error") {
    return (
      <div>
        <h1>Error/</h1>
      </div>
    );
  }

  console.log(data);

  if (!data.data.length) {
    return (
      <div className={"flex flex-1 justify-start items-center text-3xl text-neutral-900 flex-col"}>
        <div className={"flex justify-between items-center gap-1.5"}>
          <CompassIcon />
          No matched found
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <MatchListContent matches={data.data} summoner={summoner} />
    </React.Fragment>
  );
};
