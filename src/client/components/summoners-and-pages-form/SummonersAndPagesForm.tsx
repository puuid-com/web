import * as React from "react";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { cn } from "@/client/lib/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { debounce } from "@tanstack/react-pacer";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import {
  $searchSummonersOrPages,
  type $SearchSummonersOrPageType,
} from "@/server/functions/$searchSummonersOrPages";
import { Badge } from "@/client/components/ui/badge";
import { NotebookPenIcon, SwordsIcon, UsersIcon } from "lucide-react";

type Props = {
  onSuccess: (riotId: string) => void;
  placeholder?: string;
  excludeSummoners?: boolean;
  excludeUserPages?: boolean;
};

type Suggestion =
  | {
      type: "userPage";
      item: $SearchSummonersOrPageType["userPages"][number];
    }
  | {
      type: "summoner";
      item: $SearchSummonersOrPageType["summoners"][number];
    };

export function SummonersAndPagesForm({
  onSuccess,
  placeholder = "GameName#TagLine",
  excludeSummoners = false,
  excludeUserPages = false,
}: Props) {
  const [value, setValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState<number>(-1);
  const $fn = useServerFn($searchSummonersOrPages);
  const navigate = useNavigate();

  const [term, setTerm] = React.useState("");
  const setTermDebounced = debounce(
    (text: string) => {
      setTerm(text.trim());
    },
    { wait: 500 },
  );

  const { data, isFetching } = useQuery<$SearchSummonersOrPageType>({
    queryKey: ["summoner-suggest", term, excludeSummoners, excludeUserPages],
    enabled: term.length >= 3,
    queryFn: async () => {
      if (!term)
        return {
          summoners: [],
          userPages: [],
        };

      return $fn({ data: { c: term, excludeSummoners, excludeUserPages } });
    },
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  });

  const results = data ?? { summoners: [], userPages: [] };

  const userPages = results.userPages;
  const summoners = results.summoners;

  const suggestions = React.useMemo<Suggestion[]>(() => {
    const items: Suggestion[] = [];
    for (const item of userPages) {
      items.push({ type: "userPage", item });
    }
    for (const item of summoners) {
      items.push({ type: "summoner", item });
    }
    return items;
  }, [userPages, summoners]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pick = highlight >= 0 ? suggestions[highlight] : undefined;
    if (pick) {
      handlePick(pick);
    } else if (value.trim()) {
      onSuccess(value.trim());
      setOpen(false);
    }
  };

  const handlePick = (suggestion: Suggestion) => {
    if (suggestion.type === "summoner") {
      onSuccess(suggestion.item.summoner.displayRiotId);
    } else {
      navigate({ to: "/page/$name", params: { name: suggestion.item.displayName } }).catch(
        console.error,
      );
    }
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(suggestions.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(-1, h - 1));
    } else if (e.key === "Enter") {
      // Let form submit handle selection
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const hasResults = userPages.length > 0 || summoners.length > 0;
  const showUserPagesHeader = !excludeUserPages && excludeSummoners;
  const showSummonersHeader = !excludeSummoners && excludeUserPages;

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3 w-90">
      <div className="w-full max-w-md">
        <div className="relative">
          <Input
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setTermDebounced(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              setOpen(true);
            }}
            onKeyDown={onKeyDown}
            placeholder={placeholder}
            className="bg-neutral-900 border-neutral-800 text-neutral-200 placeholder:text-neutral-500"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="riotid-suggestions"
          />

          {open && (isFetching || hasResults || term.length >= 2) ? (
            <div
              id="riotid-suggestions"
              className={cn(
                "absolute left-0 right-0 top-full z-30 mt-2",
                "rounded-md border border-neutral-800 bg-neutral-900/95 backdrop-blur shadow-xl",
                "max-h-72 overflow-auto",
              )}
              onMouseLeave={() => {
                setHighlight(-1);
              }}
            >
              {suggestions.length > 0 ? (
                <>
                  {userPages.length > 0 ? (
                    <div className="py-1">
                      {showUserPagesHeader ? (
                        <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-500 flex items-center gap-1.5">
                          <UsersIcon className="h-3 w-3" />
                          User Pages
                        </div>
                      ) : null}
                      {userPages.map((page, index) => {
                        const suggestionIndex = index;
                        const active = suggestionIndex === highlight;
                        return (
                          <button
                            key={page.id}
                            type="button"
                            className={cn(
                              "flex w-full items-center gap-3 px-3 py-2 text-left",
                              active ? "bg-neutral-800/80" : "hover:bg-neutral-800/50",
                            )}
                            onMouseEnter={() => {
                              setHighlight(suggestionIndex);
                            }}
                            onClick={() => {
                              handlePick({ type: "userPage", item: page });
                            }}
                          >
                            <img src={page.profileImage} alt="" className="h-6 w-6 rounded-sm" />
                            <div className="flex-1">
                              <div className="text-sm text-neutral-100">{page.displayName}</div>
                              {page.description ? (
                                <div className="text-[11px] text-neutral-400 truncate">
                                  {page.description}
                                </div>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {summoners.length > 0 ? (
                    <div className="py-1">
                      {showSummonersHeader ? (
                        <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-neutral-500 flex items-center gap-1.5">
                          <SwordsIcon className="h-3 w-3" />
                          Summoners
                        </div>
                      ) : null}
                      {summoners.map((s, index) => {
                        const suggestionIndex = userPages.length + index;
                        const [gameName, tagLine] = s.summoner.displayRiotId.split("#");
                        const active = suggestionIndex === highlight;
                        const icon = CDragonService.getProfileIcon(s.summoner.profileIconId);
                        return (
                          <button
                            key={s.summoner.puuid}
                            type="button"
                            className={cn(
                              "flex w-full items-center gap-3 px-3 py-2 text-left",
                              active ? "bg-neutral-800/80" : "hover:bg-neutral-800/50",
                            )}
                            onMouseEnter={() => {
                              setHighlight(suggestionIndex);
                            }}
                            onClick={() => {
                              handlePick({ type: "summoner", item: s });
                            }}
                          >
                            <img src={icon} alt="" className="h-6 w-6 rounded-sm" />
                            <div className="flex-1">
                              <div className="text-sm text-neutral-100">
                                {gameName}
                                {s.note ? (
                                  <Badge variant="secondary" className="gap-1 max-w-[50%] truncate">
                                    <NotebookPenIcon className="w-3 h-3" />{" "}
                                    <span className="truncate">{s.note.note}</span>
                                  </Badge>
                                ) : null}
                              </div>
                              <div className="text-[11px] text-neutral-400">
                                #{tagLine} • {s.summoner.region}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              ) : term.length >= 2 ? (
                <div className="px-3 py-2 text-sm text-neutral-400">No matches</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <Button type="submit" disabled={!value.trim() && highlight < 0}>
        Search
      </Button>
    </form>
  );
}
