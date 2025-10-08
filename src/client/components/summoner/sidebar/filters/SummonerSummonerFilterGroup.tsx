import { SummonerSelectDialog } from "@/client/components/summoner/SummonerSelectDialog";
import { Badge } from "@/client/components/ui/badge";
import { useSummonerFilter, type MatchesSearchKey } from "@/client/hooks/useSummonerFilter";
import { useSummonersQueryOptions } from "@/client/queries/useSummoners";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { useQueries } from "@tanstack/react-query";
import { useLoaderData, useRouteContext, useSearch } from "@tanstack/react-router";
import { type LucideIcon } from "lucide-react";
import React from "react";

type Props = {
  searchKey: MatchesSearchKey<string>;
  label: string;
  icon: LucideIcon;
};

export const SummonerSummonerFilterGroup = ({ searchKey, icon: Icon, label }: Props) => {
  const { user } = useRouteContext({ from: "__root__" });

  const { queueStats } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const searchValue = useSearch({
    from: "/lol/summoner/$riotID/matches",
    select: (s) => s[searchKey],
  });

  /**
   * These puuids were fetched by the sidebar
   */
  const alreadyFetchedPuuids = React.useMemo(
    () => queueStats?.summonerStatistic?.statsByTeammates.map((t) => t.puuid) ?? [],
    [queueStats?.summonerStatistic?.statsByTeammates],
  );
  /**
   * Now, we would like to only fetch the puuids that are used in the filters, but do not come from the sidebar
   */
  const notFetchedPuuids = React.useMemo(() => {
    return searchValue?.filter((p) => !alreadyFetchedPuuids.includes(p)) ?? [];
  }, [alreadyFetchedPuuids, searchValue]);

  const summonersData = useQueries({
    queries: [
      useSummonersQueryOptions(alreadyFetchedPuuids, user?.id),
      useSummonersQueryOptions(notFetchedPuuids, user?.id, "extra"),
    ],
    combine: (results) => {
      const isLoaded = results.every((r) => r.status === "success");

      if (!isLoaded) {
        return {
          isLoaded: false,
          data: [],
        };
      } else {
        return {
          isLoaded: true,
          data: results.flatMap((r) => r.data!),
        };
      }
    },
  });

  const summoners = React.useMemo(() => summonersData.data, [summonersData.data]);

  const { setFilterValues } = useSummonerFilter(searchKey);

  const values = React.useMemo(() => {
    if (!searchValue?.length || !summoners.length) return [];

    return searchValue.map((value) => {
      const { summoner, note } = summoners.find((s) => s.summoner.puuid === value)!;

      return {
        id: value,
        displayRiotId: summoner.displayRiotId,
        region: summoner.region,
        imageUrl: CDragonService.getProfileIcon(summoner.profileIconId),
        note: note?.note,
      };
    });
  }, [searchValue, summoners]);

  const MAX = 3;
  const shown = values.slice(0, MAX);
  const hidden = values.length - shown.length;

  return (
    <SummonerSelectDialog allowMultiple selectedSummoners={values} onSave={setFilterValues}>
      <button
        className={
          "flex gap-1 items-center border px-1.5 py-1 rounded-md  hover:bg-main/20 transition-colors duration-200 hover:cursor-pointer"
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
    </SummonerSelectDialog>
  );
};
