import * as React from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { debounce } from "@tanstack/react-pacer";
import { useServerFn } from "@tanstack/react-start";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/client/components/ui/dialog";
import { Input } from "@/client/components/ui/input";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { cn } from "@/client/lib/utils";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import {
  $searchSummonersOrPages,
  type $SearchSummonersOrPageType,
} from "@/server/functions/$searchSummonersOrPages";
import { CheckIcon, NotebookPenIcon, SearchIcon, XIcon } from "lucide-react";

type SelectedSummonerValue = {
  id: string;
  displayRiotId: string;
  region: string;
  imageUrl: string;
  note?: string | null;
};

type SummonerSelectDialogProps = {
  children: React.ReactElement;
  selectedSummoners?: SelectedSummonerValue[];
  onSave?: (summonerIds: string[], details: SelectedSummonerValue[]) => void;
  allowMultiple?: boolean;
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  emptyStateText?: string;
  maxVisibleSummoners?: number;
};

const _selectedSummoners: SelectedSummonerValue[] = [];

export function SummonerSelectDialog({
  children,
  selectedSummoners = _selectedSummoners,
  onSave,
  allowMultiple = true,
  title = "Select summoners",
  description = allowMultiple
    ? "Pick one or more summoners to filter the results."
    : "Pick a summoner to filter the results.",
  searchPlaceholder = "Search by Riot ID",
  emptyStateText = "No summoners match your search.",
  maxVisibleSummoners = 5,
}: SummonerSelectDialogProps) {
  const $fn = useServerFn($searchSummonersOrPages);

  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [term, setTerm] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>(() =>
    selectedSummoners.map((summoner) => summoner.id),
  );
  const [detailsMap, setDetailsMap] = React.useState<Map<string, SelectedSummonerValue>>(() => {
    const initial = new Map<string, SelectedSummonerValue>();
    for (const summoner of selectedSummoners) {
      initial.set(summoner.id, summoner);
    }
    return initial;
  });

  const maxVisible = Math.max(1, maxVisibleSummoners);
  const LIST_ITEM_HEIGHT = 56;
  const LIST_GAP = 4;
  const listHeight = maxVisible * LIST_ITEM_HEIGHT + Math.max(0, maxVisible - 1) * LIST_GAP;

  const setTermDebounced = React.useMemo(
    () =>
      debounce(
        (value: string) => {
          setTerm(value.trim());
        },
        { wait: 400 },
      ),
    [],
  );

  React.useEffect(() => {
    // eslint-disable-next-line react-you-might-not-need-an-effect/no-pass-data-to-parent
    setSelectedIds(selectedSummoners.map((summoner) => summoner.id));
    setDetailsMap((prev) => {
      const next = new Map<string, SelectedSummonerValue>();
      for (const summoner of selectedSummoners) {
        const existing = prev.get(summoner.id);
        next.set(summoner.id, existing ?? summoner);
      }
      return next;
    });
  }, [selectedSummoners]);

  const { data, isFetching } = useQuery<$SearchSummonersOrPageType>({
    queryKey: ["summoner-select", term],
    enabled: term.length >= 3,
    queryFn: async () => {
      if (!term)
        return {
          summoners: [],
          userPages: [],
        } satisfies $SearchSummonersOrPageType;

      return $fn({ data: { c: term, excludeUserPages: true } });
    },
    staleTime: 10_000,
    placeholderData: keepPreviousData,
  });

  const summonerResults = data?.summoners;

  const summonerOptions = React.useMemo<SelectedSummonerValue[]>(() => {
    return (summonerResults ?? []).map((item) => {
      const { summoner, note } = item;

      return {
        id: summoner.puuid,
        displayRiotId: summoner.displayRiotId,
        region: summoner.region,
        imageUrl: CDragonService.getProfileIcon(summoner.profileIconId),
        note: note?.note ?? null,
      } satisfies SelectedSummonerValue;
    });
  }, [summonerResults]);

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  React.useEffect(() => {
    if (summonerOptions.length === 0) return;
    setDetailsMap((prev) => {
      let mutated = false;
      const next = new Map(prev);

      for (const option of summonerOptions) {
        if (selectedSet.has(option.id)) {
          next.set(option.id, option);
          mutated = true;
        }
      }
      return mutated ? next : prev;
    });
  }, [summonerOptions, selectedSet]);

  const visibleSummoners = React.useMemo(() => {
    return summonerOptions.slice(0, maxVisible);
  }, [summonerOptions, maxVisible]);

  const detailsSnapshotRef = React.useRef<Map<string, SelectedSummonerValue>>(new Map());
  const closeReasonRef = React.useRef<"save" | "cancel" | null>(null);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        detailsSnapshotRef.current = new Map(detailsMap);
        closeReasonRef.current = null;
      } else {
        const reason = closeReasonRef.current;
        const shouldRevert = reason !== "save";

        if (shouldRevert) {
          setSelectedIds(selectedSummoners.map((summoner) => summoner.id));
          setDetailsMap(new Map(detailsSnapshotRef.current));
        }

        setInputValue("");
        setTerm("");
        setTermDebounced("");
      }

      setIsOpen(nextOpen);
    },
    [detailsMap, selectedSummoners, setTermDebounced],
  );

  const handleToggleSummoner = React.useCallback(
    (option: SelectedSummonerValue) => {
      setSelectedIds((prev) => {
        const exists = prev.includes(option.id);
        let next: string[];
        if (allowMultiple) {
          next = exists ? prev.filter((id) => id !== option.id) : [...prev, option.id];
        } else {
          next = exists ? [] : [option.id];
        }

        setDetailsMap((prevMap) => {
          const nextMap = new Map(prevMap);
          if (!allowMultiple) {
            nextMap.clear();
          }

          if (exists) {
            nextMap.delete(option.id);
          } else {
            nextMap.set(option.id, option);
          }

          for (const key of Array.from(nextMap.keys())) {
            if (!next.includes(key)) {
              nextMap.delete(key);
            }
          }

          return nextMap;
        });

        return next;
      });
    },
    [allowMultiple],
  );

  const handleRemove = React.useCallback((puuid: string) => {
    setSelectedIds((prev) => {
      if (!prev.includes(puuid)) return prev;
      const next = prev.filter((id) => id !== puuid);
      setDetailsMap((prevMap) => {
        const nextMap = new Map(prevMap);
        nextMap.delete(puuid);
        return nextMap;
      });
      return next;
    });
  }, []);

  const handleClearAll = React.useCallback(() => {
    setSelectedIds([]);
    setDetailsMap((prev) => {
      if (prev.size === 0) return prev;
      return new Map();
    });
  }, []);

  const handleCancel = React.useCallback(() => {
    closeReasonRef.current = "cancel";
    setIsOpen(false);
  }, []);

  const handleSave = React.useCallback(() => {
    const details: SelectedSummonerValue[] = selectedIds
      .map((id) => detailsMap.get(id))
      .filter((detail): detail is SelectedSummonerValue => !!detail);
    onSave?.(selectedIds, details);
    closeReasonRef.current = "save";
    setIsOpen(false);
  }, [detailsMap, onSave, selectedIds]);

  const shouldShowInstructions = term.length < 3 && !isFetching && summonerOptions.length === 0;
  const noMatches = term.length >= 3 && summonerOptions.length === 0 && !isFetching;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Search
            </label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={inputValue}
                onChange={(event) => {
                  const value = event.target.value;
                  setInputValue(value);
                  setTermDebounced(value);
                }}
                placeholder={searchPlaceholder}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 ? (
              <>
                {selectedIds.map((id) => {
                  const detail = detailsMap.get(id);
                  const displayName = detail?.displayRiotId ?? id;
                  const [chipName, chipTag = ""] = displayName.split("#");
                  return (
                    <Badge asChild key={id} variant="secondary" className="pr-1">
                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={() => {
                          handleRemove(id);
                        }}
                      >
                        {detail ? (
                          <img
                            src={detail.imageUrl}
                            alt=""
                            className="h-5 w-5 rounded-sm object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span className="h-5 w-5 rounded-sm bg-neutral-800" />
                        )}
                        <span>
                          {chipName}
                          {chipTag ? `#${chipTag}` : ""}
                        </span>
                        <XIcon className="h-3 w-3" />
                        <span className="sr-only">Remove {displayName}</span>
                      </button>
                    </Badge>
                  );
                })}
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={handleClearAll}
                  className="ml-1"
                >
                  Clear all
                </Button>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No summoners selected.</span>
            )}
          </div>

          <div className="flex flex-col gap-1 px-1" style={{ height: listHeight }}>
            {shouldShowInstructions ? (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed border-neutral-800 bg-neutral-950/60 text-xs text-muted-foreground">
                Type at least 3 characters to search.
              </div>
            ) : noMatches ? (
              <div className="flex h-full items-center justify-center rounded-md border border-dashed border-neutral-800 bg-neutral-950/60 text-sm text-muted-foreground">
                {emptyStateText}
              </div>
            ) : (
              <>
                {visibleSummoners.map((option) => {
                  const isSelected = selectedSet.has(option.id);
                  const metaParts: string[] = [];
                  const [gameName, tagLine] = option.displayRiotId.split("#");

                  if (tagLine) metaParts.push(`#${tagLine}`);
                  if (option.region) metaParts.push(option.region);
                  const secondaryLabel = metaParts.join(" • ");
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => {
                        handleToggleSummoner(option);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition",
                        isSelected
                          ? "border-main bg-main/15 text-main"
                          : "border-transparent bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/70",
                      )}
                    >
                      <img
                        src={option.imageUrl}
                        alt=""
                        className="h-9 w-9 rounded-sm object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="flex-1">
                        <div className="text-sm text-neutral-100">
                          {gameName}
                          {option.note ? (
                            <Badge
                              variant="secondary"
                              className="ml-2 inline-flex items-center gap-1 max-w-[50%] truncate align-middle"
                            >
                              <NotebookPenIcon className="h-3 w-3" />
                              <span className="truncate">{option.note}</span>
                            </Badge>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-neutral-400">{secondaryLabel}</div>
                      </div>
                      {isSelected ? <CheckIcon className="h-4 w-4" /> : null}
                    </button>
                  );
                })}

                {summonerOptions.length > maxVisible ? (
                  <div className="px-3 pb-1 pt-2 text-xs text-neutral-500">
                    Showing first {visibleSummoners.length} of {summonerOptions.length} summoners.
                    Refine your search to narrow results.
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={selectedIds.length === 0}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { SelectedSummonerValue };
