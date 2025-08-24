import { cn } from "@/client/lib/utils";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import React from "react";

type Props = {
  championId: number;
};

export const MatchItemChampionName = ({ championId }: Props) => {
  const { c = "" } = useSearch({ from: "/lol/summoner/$riotID/matches" });
  const { champions } = useLoaderData({ from: "/lol" });

  const name = champions[championId]!.name;

  if (!c) return <>{name}</>;

  const prefix = name.slice(0, c.length);
  const rest = name.slice(c.length);

  return (
    <span>
      {prefix ? (
        <span
          className={cn(
            "bg-main/50 text-main-foreground p-0.5 rounded text-shadow-lg",
            "[&:has(+span)]:pr-0 [&:has(+span)]:rounded-r-none",
          )}
        >
          {prefix}
        </span>
      ) : null}
      {rest ? <span>{rest}</span> : null}
    </span>
  );
};
