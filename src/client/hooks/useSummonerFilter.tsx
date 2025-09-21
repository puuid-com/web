import type { ArrayKeys } from "@/client/lib/typeHelper";
import type { Route } from "@/routes/lol/summoner/$riotID/matches";
import { useSearch, useNavigate } from "@tanstack/react-router";
import React, { useCallback } from "react";

type MatchesRouteSearchType = (typeof Route)["types"]["fullSearchSchema"];
export type MatchesSearchKey<K = unknown> = ArrayKeys<MatchesRouteSearchType, K>;

type ValueType = {
  handleOnFilterClickEvent: (value: unknown) => (e: React.MouseEvent<HTMLButtonElement>) => void;
  isEqualToFilterValue: (value: unknown) => boolean;
  handleFilterChanges: (value: unknown, isAdditive: boolean) => void;
  setFilterValues: (values: unknown) => void;
};

export const useSummonerFilter = (key: MatchesSearchKey) => {
  const searchKeyValue = useSearch({
    from: "/lol/summoner/$riotID/matches",
    select: (s) => s[key] as unknown[] | undefined,
  });

  const navigate = useNavigate({ from: "/lol/summoner/$riotID/matches" });

  const handleFilterChanges = useCallback(
    (value: unknown, isAdditive: boolean) => {
      let newFilter: unknown[] | undefined;
      const alreadyFiltered = (searchKeyValue?.indexOf(value) ?? -1) !== -1;

      if (!searchKeyValue) {
        newFilter = [value];
      } else if (searchKeyValue.length === 1 && alreadyFiltered) {
        newFilter = undefined;
      } else if (alreadyFiltered) {
        newFilter = searchKeyValue.filter((s) => s !== value);
      } else {
        newFilter = [...searchKeyValue, value];
      }

      navigate({
        to: ".",
        search: (s) => {
          return {
            ...s,
            ...(isAdditive
              ? {}
              : { mc: undefined, c: undefined, pc: undefined, w: undefined, t: undefined }),
            [key]: newFilter,
          };
        },
      }).catch(console.error);
    },
    [key, navigate, searchKeyValue],
  );

  const handleOnFilterClickEvent = useCallback(
    (value: unknown) => (e: React.MouseEvent<HTMLButtonElement>) => {
      const isAdditive = e.metaKey || e.ctrlKey;

      handleFilterChanges(value, isAdditive);
    },
    [handleFilterChanges],
  );

  const isEqualToFilterValue = useCallback(
    (value: unknown) => {
      return searchKeyValue?.includes(value) ?? false;
    },
    [searchKeyValue],
  );

  const setFilterValues = useCallback(
    (values: unknown) => {
      navigate({
        to: ".",
        search: (s) => {
          return {
            ...s,
            [key]: values,
          };
        },
      }).catch(console.error);
    },
    [key, navigate],
  );

  const value = React.useMemo<ValueType>(() => {
    return {
      isEqualToFilterValue,
      handleOnFilterClickEvent,
      handleFilterChanges,
      setFilterValues,
    };
  }, [handleFilterChanges, handleOnFilterClickEvent, isEqualToFilterValue, setFilterValues]);

  return value;
};
