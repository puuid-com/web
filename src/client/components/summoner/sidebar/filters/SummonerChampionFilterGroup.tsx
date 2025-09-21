import { ChampionSelectDialog } from "@/client/components/champion/ChampionSelectDialog";
import { Badge } from "@/client/components/ui/badge";
import { useSummonerFilter, type MatchesSearchKey } from "@/client/hooks/useSummonerFilter";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";
import React from "react";

type Props = {
  searchKey: MatchesSearchKey<number>;
  label: string;
  icon: LucideIcon;
};

export const SummonerChampionFilterGroup = ({ searchKey, icon: Icon, label }: Props) => {
  const metadata = useLoaderData({ from: "__root__" });
  const searchValue = useSearch({
    from: "/lol/summoner/$riotID/matches",
    select: (s) => s[searchKey],
  });
  const { setFilterValues } = useSummonerFilter(searchKey);

  const values = React.useMemo(() => {
    return (searchValue ?? []).map((value) => {
      return {
        id: value,
        name: DDragonService.getChampionName(metadata.champions, value),
        imageUrl: CDragonService.getChampionSquare(value),
      };
    });
  }, [metadata.champions, searchValue]);

  const MAX = 3;
  const shown = values.slice(0, MAX);
  const hidden = values.length - shown.length;

  return (
    <ChampionSelectDialog allowMultiple selectedChampionIds={searchValue} onSave={setFilterValues}>
      <button
        className={
          "flex gap-1 items-center border px-1.5 py-1 rounded-md hover:bg-main/20 transition-colors duration-200 hover:cursor-pointer"
        }
      >
        <div className={"text-xs flex gap-1 items-center font-bold"}>
          <Icon className={"w-3"} />
          {label}
        </div>
        <div className="flex items-center -space-x-2">
          {shown.map((c, i) => (
            <div key={c.id} className="relative isolate" style={{ zIndex: shown.length - i }}>
              <div
                className="shrink-0 w-5 aspect-square rounded-full bg-cover bg-no-repeat ring-2 ring-background shadow-sm"
                style={{
                  backgroundImage: c.imageUrl ? `url(${c.imageUrl})` : undefined,
                  backgroundSize: "105%",
                }}
              />
            </div>
          ))}

          {!values.length ? (
            <Badge variant={"icon"} className={"text-muted-foreground p-1"}>
              {" "}
              No filter{" "}
            </Badge>
          ) : null}

          {hidden > 0 && (
            <Badge
              className="ml-2"
              title={`${hidden} more`}
              aria-label={`${hidden} more`}
              variant={"main"}
            >
              +{hidden}
            </Badge>
          )}
        </div>
      </button>
    </ChampionSelectDialog>
  );
};
