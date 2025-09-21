import * as React from "react";
import { useLoaderData } from "@tanstack/react-router";
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
import { CheckIcon, SearchIcon, XIcon } from "lucide-react";

type ChampionOption = {
  championId: number;
  id: string;
  key: string;
  name: string;
  imageUrl: string;
  searchText: string;
};

type ChampionSelectDialogProps = {
  selectedChampionIds?: number[];
  onSave?: (championIds: number[]) => void;
  allowMultiple?: boolean;
  title?: string;
  description?: string;
  searchPlaceholder?: string;
  emptyStateText?: string;
  maxVisibleChampions?: number;
};

const _selectedChampionIds: number[] = [];

export function ChampionSelectDialog({
  children,
  selectedChampionIds = _selectedChampionIds,
  onSave,
  allowMultiple = true,
  title = "Select champions",
  description = allowMultiple
    ? "Pick one or more champions to filter the results."
    : "Pick a champion to filter the results.",
  searchPlaceholder = "Search champions",
  emptyStateText = "No champions match your search.",
  maxVisibleChampions = 3,
}: React.PropsWithChildren<ChampionSelectDialogProps>) {
  const metadata = useLoaderData({ from: "__root__" });

  const [isOpen, setIsOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<number[]>(selectedChampionIds);

  const maxVisible = Math.max(1, maxVisibleChampions);
  const LIST_ITEM_HEIGHT = 56;
  const LIST_GAP = 4;
  const listHeight = maxVisible * LIST_ITEM_HEIGHT + Math.max(0, maxVisible - 1) * LIST_GAP;

  React.useEffect(() => {
    setSelectedIds(selectedChampionIds);
  }, [selectedChampionIds]);

  React.useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  const championOptions = React.useMemo<ChampionOption[]>(() => {
    const champions = metadata.champions;
    const mapped = Object.entries(champions).map(([key, champion]) => {
      const championId = Number(key);
      return {
        championId,
        id: champion.id,
        key: champion.key,
        name: champion.name,
        imageUrl: CDragonService.getChampionSquare(championId),
        searchText: `${champion.name} ${champion.id} ${champion.key}`.toLowerCase(),
      } satisfies ChampionOption;
    });

    mapped.sort((a, b) => a.name.localeCompare(b.name));
    return mapped;
  }, [metadata.champions]);

  const championById = React.useMemo(() => {
    const map = new Map<number, ChampionOption>();
    for (const option of championOptions) {
      map.set(option.championId, option);
    }
    return map;
  }, [championOptions]);

  const filteredChampions = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return championOptions;
    return championOptions.filter((champion) => champion.searchText.includes(term));
  }, [championOptions, searchTerm]);

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds]);

  const visibleChampions = React.useMemo(() => {
    return filteredChampions.slice(0, maxVisible);
  }, [filteredChampions, maxVisible]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        setSelectedIds(selectedChampionIds);
      }
      setIsOpen(nextOpen);
    },
    [selectedChampionIds],
  );

  const handleToggleChampion = React.useCallback(
    (championId: number) => {
      setSelectedIds((prev) => {
        const exists = prev.includes(championId);
        if (allowMultiple) {
          return exists ? prev.filter((id) => id !== championId) : [...prev, championId];
        }
        return exists ? [] : [championId];
      });
    },
    [allowMultiple],
  );

  const handleClearAll = React.useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleCancel = React.useCallback(() => {
    setSelectedIds(selectedChampionIds);
    setIsOpen(false);
  }, [selectedChampionIds]);

  const handleSave = React.useCallback(() => {
    onSave?.(selectedIds);
    setIsOpen(false);
  }, [onSave, selectedIds]);

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
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
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
                  const champion = championById.get(id);
                  if (!champion) return null;
                  return (
                    <Badge asChild key={id} variant="secondary" className="pr-1">
                      <button
                        type="button"
                        className="flex items-center gap-1"
                        onClick={() => {
                          handleToggleChampion(id);
                        }}
                      >
                        <img
                          src={champion.imageUrl}
                          alt=""
                          className="h-5 w-5 rounded-sm object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        <span>{champion.name}</span>
                        <XIcon className="h-3 w-3" />
                        <span className="sr-only">Remove {champion.name}</span>
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
              <span className="text-xs text-muted-foreground">No champions selected.</span>
            )}
          </div>

          {filteredChampions.length === 0 ? (
            <div
              className="flex items-center justify-center rounded-md border border-dashed border-neutral-800 bg-neutral-950/60 text-sm text-muted-foreground"
              style={{ height: listHeight }}
            >
              {emptyStateText}
            </div>
          ) : (
            <div className="flex flex-col gap-1 px-1" style={{ height: listHeight }}>
              {visibleChampions.map((champion) => {
                const isSelected = selectedSet.has(champion.championId);

                return (
                  <button
                    key={champion.championId}
                    type="button"
                    onClick={() => {
                      handleToggleChampion(champion.championId);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left transition",
                      isSelected
                        ? "border-main bg-main/15 text-main"
                        : "border-transparent bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/70",
                    )}
                  >
                    <img
                      src={champion.imageUrl}
                      alt=""
                      className="h-9 w-9 rounded-sm object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-100">{champion.name}</div>
                    </div>
                    {isSelected ? <CheckIcon className="h-4 w-4" /> : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="mt-2">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
