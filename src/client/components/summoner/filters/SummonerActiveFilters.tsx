// ActiveFilters.tsx
import * as React from "react";
import { X, Filter, CheckCircle2, CircleSlash2, Users, Sparkles } from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/client/components/ui/tooltip";
import type { Route } from "@/routes/lol/summoner/$riotID/matches";
import type { Prettify } from "better-auth";
import type { ArrayKeys } from "@/client/lib/typeHelper";

type MatchesRouteSearchType = Prettify<(typeof Route)["types"]["fullSearchSchema"]>;
type MatchesRouteSearchArrayKeys = ArrayKeys<MatchesRouteSearchType>;

type Props = {
  championNameById?: (id: number) => string;
  teammateLabel?: (puuidOrId: string) => string;
  className?: string;
};

export const SummonerActiveFilters: React.FC<Props> = ({
  championNameById,
  teammateLabel,
  className,
}) => {
  const search = useSearch({ from: "/lol/summoner/$riotID/matches" });
  const navigate = useNavigate({ from: "/lol/summoner/$riotID/matches" });

  const hasAny =
    !!search.q.length ||
    !!search.c ||
    typeof search.w === "boolean" ||
    !!search.pc?.length ||
    !!search.mc?.length ||
    !!search.t?.length;

  const setSearch = React.useCallback(
    (updater: (prev: MatchesRouteSearchType) => MatchesRouteSearchType) => {
      navigate({
        search: (prev: MatchesRouteSearchType) => updater(prev),
        replace: true,
      }).catch(console.error);
    },
    [navigate],
  );

  const clearKey = (key: keyof MatchesRouteSearchType) => {
    navigate({
      search: (prev: MatchesRouteSearchType) => {
        prev[key] = undefined as never;

        return prev;
      },
      replace: true,
    }).catch(console.error);
  };

  const removeFromArrayKey = (key: MatchesRouteSearchArrayKeys, value: unknown) => {
    setSearch((prev) => {
      const curr = prev[key] as unknown as unknown[];
      if (!Array.isArray(curr)) return prev;
      const filtered = curr.filter((v) => v !== value);
      const next = { ...prev };
      next[key] = (filtered.length ? filtered : undefined) as never;
      return next;
    });
  };

  const prettyBool = (w?: boolean) => (w === true ? "Win" : w === false ? "Loss" : "");

  if (!hasAny) {
    return (
      <div
        className={[
          "flex items-center gap-2 rounded-2xl border p-3 text-sm opacity-70",
          className,
        ].join(" ")}
      >
        <Filter className="h-4 w-4" />
        No active filters
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div
        className={[
          "flex flex-col gap-3 rounded-2xl border p-3",
          "bg-gradient-to-b from-muted/40 to-background",
          className,
        ].join(" ")}
        role="region"
        aria-label="Active filters"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Active filters</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1"
            onClick={() => {
              setSearch(() => ({}) as MatchesRouteSearchType);
            }}
          >
            <X className="h-4 w-4" />
            Clear all
          </Button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Contains */}
          {search.c ? (
            <FilterGroup
              icon={<Sparkles className="h-3.5 w-3.5" />}
              title="Search"
              onClear={() => {
                clearKey("c");
              }}
            >
              <ClosableBadge
                onClose={() => {
                  clearKey("c");
                }}
              >
                {search.c}
              </ClosableBadge>
            </FilterGroup>
          ) : null}

          {/* Result */}
          {typeof search.w === "boolean" ? (
            <FilterGroup
              icon={
                search.w ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <CircleSlash2 className="h-3.5 w-3.5" />
                )
              }
              title="Result"
              onClear={() => {
                clearKey("w");
              }}
            >
              <ClosableBadge
                onClose={() => {
                  clearKey("w");
                }}
              >
                {prettyBool(search.w)}
              </ClosableBadge>
            </FilterGroup>
          ) : null}

          {/* Played Champs */}
          {search.pc?.length ? (
            <FilterGroup
              icon={<Users className="h-3.5 w-3.5" />}
              title="Played champion"
              onClear={() => {
                clearKey("pc");
              }}
            >
              <div className="flex flex-wrap gap-2">
                {search.pc.map((id) => {
                  const label = championNameById ? championNameById(id) : `#${id}`;
                  return (
                    <ClosableBadge
                      key={`pc-${id}`}
                      onClose={() => {
                        removeFromArrayKey("pc", id);
                      }}
                    >
                      {label}
                    </ClosableBadge>
                  );
                })}
              </div>
            </FilterGroup>
          ) : null}

          {/* Matchup Champs */}
          {search.mc?.length ? (
            <FilterGroup
              icon={<Users className="h-3.5 w-3.5" />}
              title="Matchup champion"
              onClear={() => {
                clearKey("mc");
              }}
            >
              <div className="flex flex-wrap gap-2">
                {search.mc.map((id) => {
                  const label = championNameById ? championNameById(id) : `#${id}`;
                  return (
                    <ClosableBadge
                      key={`mc-${id}`}
                      onClose={() => {
                        removeFromArrayKey("mc", id);
                      }}
                    >
                      {label}
                    </ClosableBadge>
                  );
                })}
              </div>
            </FilterGroup>
          ) : null}

          {/* Teammates */}
          {search.t?.length ? (
            <FilterGroup
              icon={<Users className="h-3.5 w-3.5" />}
              title="Teammates"
              onClear={() => {
                clearKey("t");
              }}
            >
              <div className="flex flex-wrap gap-2">
                {search.t.map((id) => {
                  const label = teammateLabel ? teammateLabel(id) : id;
                  return (
                    <ClosableBadge
                      key={`t-${id}`}
                      onClose={() => {
                        removeFromArrayKey("t", id);
                      }}
                    >
                      {label}
                    </ClosableBadge>
                  );
                })}
              </div>
            </FilterGroup>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  );
};

const FilterGroup: React.FC<{
  icon: React.ReactNode;
  title: string;
  onClear: () => void;
  children: React.ReactNode;
}> = ({ icon, title, onClear, children }) => {
  return (
    <div className="rounded-2xl border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground/5">
            {icon}
          </span>
          <span className="text-sm font-medium">{title}</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              aria-label={`Clear ${title}`}
              onClick={onClear}
            >
              <X className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear group</TooltipContent>
        </Tooltip>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
};

const ClosableBadge: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({
  onClose,
  children,
}) => {
  return (
    <Badge
      variant="secondary"
      className="group inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ring-1 ring-border"
    >
      <span className="max-w-[14rem] truncate">{children}</span>
      <button
        type="button"
        aria-label="Remove"
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full transition-opacity group-hover:opacity-100 opacity-70"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
};
