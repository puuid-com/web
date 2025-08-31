import { Badge } from "@/client/components/ui/badge";
import { Input } from "@/client/components/ui/input";
import { Label } from "@/client/components/ui/label";
import { Switch } from "@/client/components/ui/switch";
import type { FriendlyQueueType } from "@/client/lib/typeHelper";
import { debounce } from "@tanstack/pacer";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search } from "lucide-react";
import React from "react";

type Props = {
  dataCount: number;
};

export const ChampionMasteryFilters = ({ dataCount }: Props) => {
  const search = useSearch({ from: "/lol/summoner/$riotID/mastery" });
  const navigate = useNavigate({ from: "/lol/summoner/$riotID/mastery" });

  const [searchValue, setSearchValue] = React.useState<string>(search.champion ?? "");

  const handleChampionFilter = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setSearchValue(value);
    _debouncedChampionFilter(value);
  };

  const _debouncedChampionFilter = debounce(
    (value: string) => {
      navigate({
        search: (s) => ({
          ...s,
          champion: value,
        }),
        replace: true,
      }).catch(console.error);
    },
    {
      wait: 500,
    },
  );

  const handleQueueChange = (queue: FriendlyQueueType) => {
    navigate({
      search: (s) => ({
        ...s,
        queue: queue,
      }),
      replace: true,
    }).catch(console.error);
  };

  /* const togglePosition = (position: IndividualPositionType) => {
    const _newPositions = search.positions?.includes(position)
      ? search.positions.filter((p) => p !== position)
      : [...(search.positions ?? []), position];

    navigate({
      search: (s) => ({
        ...s,
        positions: _newPositions.length ? _newPositions : undefined,
      }),
      replace: true,
    }).catch(console.error);
  };

  const clearPositionsFilter = () => {
    navigate({
      search: (s) => ({
        ...s,
        positions: undefined,
      }),
      replace: true,
    }).catch(console.error);
  }; */

  const setShowPlayedOnly = (value: boolean) => {
    navigate({
      search: (s) => ({
        ...s,
        onlyPlayed: value,
      }),
      replace: true,
    }).catch(console.error);
  };

  /* const hasPositionsFilters: boolean = search.positions ? search.positions.length > 0 : false; */

  return (
    <div className="p-4 bg-card/50 border border-border/50 rounded-lg backdrop-blur-sm">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search champions..."
            value={searchValue}
            onChange={handleChampionFilter}
            className="pl-10 h-9 bg-background/80 border-border/60"
          />
        </div>

        {/* Queue Type Toggle */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Queue:</span>
          <div className="flex bg-muted/80 rounded-md p-0.5">
            <button
              onClick={() => {
                handleQueueChange("solo");
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                search.queue === "solo"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ranked
            </button>
            <button
              onClick={() => {
                handleQueueChange("flex");
              }}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-all ${
                search.queue === "flex"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Normal
            </button>
          </div>
        </div>

        {/* Positions Dropdown */}
        {/* <Popover open={positionsOpen} onOpenChange={setPositionsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 bg-background/80 border-border/60 hover:bg-background"
            >
              <Filter className="h-4 w-4 mr-2" />
              {hasPositionsFilters
                ? "All Roles"
                : search.positions?.length === 1
                  ? search.positions[0]
                  : `${search.positions?.length} Roles`}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-3" align="start">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Roles</span>
                {hasPositionsFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearPositionsFilter}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {individualPositions.map((position) => (
                  <div key={position} className="flex items-center space-x-2">
                    <Checkbox
                      id={position}
                      checked={search.positions?.includes(position)}
                      onCheckedChange={() => {
                        togglePosition(position);
                      }}
                      className="h-4 w-4"
                    />
                    <Label htmlFor={position} className="text-sm cursor-pointer flex-1">
                      {position}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover> */}

        {/* Played Champions Toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="played-toggle"
            checked={search.onlyPlayed}
            onCheckedChange={setShowPlayedOnly}
            className="scale-90"
          />
          <Label htmlFor="played-toggle" className="text-sm cursor-pointer whitespace-nowrap">
            Played only
          </Label>
        </div>

        {/* Results Count */}
        <div className="ml-auto">
          <Badge variant="secondary" className="text-xs">
            {dataCount} champions
          </Badge>
        </div>
      </div>
    </div>
  );
};
