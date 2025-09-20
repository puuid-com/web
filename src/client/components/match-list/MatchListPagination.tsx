import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "@/client/components/ui/pagination";
import { useGetSummonerMatches } from "@/client/queries/getSummonerMatches";
import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import React from "react";

type Props = {};

export const MatchListPagination = ({}: Props) => {
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const filters = useSearch({
    from: "/lol/summoner/$riotID/matches",
  });
  const navigate = useNavigate({
    from: "/lol/summoner/$riotID/matches",
  });

  const { data } = useGetSummonerMatches({
    summoner: summoner,
    filters: filters,
  });

  const handleNavigationToPage = (p: number) => {
    navigate({
      to: ".",
      search: (s) => ({
        ...s,
        p: p,
      }),
    }).catch(console.error);
  };

  const handleNavigateToPreviousPage = () => {
    if (!hasPreviousPage) return;

    handleNavigationToPage(filters.p - 1);
  };

  const handleNavigateToNextPage = () => {
    if (!hasNextPage) return;

    handleNavigationToPage(filters.p + 1);
  };

  if (!data) return null;

  const hasPreviousPage = filters.p > 1;
  const hasNextPage = !!data.next_page;
  const currentPage = filters.p;

  const shouldShowFirstPage = filters.p > 2;

  return (
    <Pagination>
      <PaginationContent>
        {shouldShowFirstPage ? (
          <PaginationItem>
            <PaginationLink
              onClick={() => {
                handleNavigationToPage(1);
              }}
            >
              {1}
            </PaginationLink>
          </PaginationItem>
        ) : null}
        {hasPreviousPage ? (
          <PaginationItem>
            <PaginationPrevious onClick={handleNavigateToPreviousPage} />
          </PaginationItem>
        ) : null}

        <PaginationItem>
          <PaginationLink href="#">{currentPage}</PaginationLink>
        </PaginationItem>
        {hasNextPage ? (
          <PaginationItem>
            <PaginationNext onClick={handleNavigateToNextPage} />
          </PaginationItem>
        ) : null}
      </PaginationContent>
    </Pagination>
  );
};
