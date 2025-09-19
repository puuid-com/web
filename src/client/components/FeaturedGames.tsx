import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/client/components/ui/accordion";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/components/ui/card";
import { Input } from "@/client/components/ui/input";
import { ScrollArea } from "@/client/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/client/components/ui/select";
import { Separator } from "@/client/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/client/components/ui/tooltip";
import { cn, formatSeconds } from "@/client/lib/utils";
import type {
  BannedChampionDTOType,
  FeaturedGameInfoDTOType,
  FeaturedGamesDTOType,
  ParticipantDTOType,
} from "@puuid/core/server/api-route/riot/spectator/FeaturedGamesDTO";
import { Clock3, Copy, Gamepad2, MapPinned, ShieldQuestion, Users } from "lucide-react";
import React from "react";

function short(str: string, head = 6, tail = 4) {
  if (str.length <= head + tail + 1) return str;
  return `${str.slice(0, head)}…${str.slice(-tail)}`;
}

function TeamPill({ id }: { id: number }) {
  const isBlue = id === 100;
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        isBlue ? "border-sky-500/50 text-sky-600" : "border-rose-500/50 text-rose-600",
      )}
    >
      Team {id}
    </Badge>
  );
}

function BansRow({ bans }: { bans: BannedChampionDTOType[] }) {
  if (!bans.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {bans.map((b, i) => (
        <Badge
          key={`${b.teamId}-${b.pickTurn}-${i}`}
          variant="secondary"
          className={cn(
            "text-xs font-medium",
            b.teamId === 100 ? "bg-sky-50 text-sky-700" : "bg-rose-50 text-rose-700",
          )}
        >
          <span className="mr-1">Ban</span>
          <span className="mr-1">#{b.pickTurn}</span>
          <span className="opacity-70">champ {b.championId}</span>
        </Badge>
      ))}
    </div>
  );
}

function ParticipantsTable({ team, list }: { team: number; list: ParticipantDTOType[] }) {
  return (
    <div className="rounded-xl border bg-card p-3 shadow-sm">
      <div className="mb-2 flex items-center gap-2">
        <TeamPill id={team} />
        <Badge variant="outline" className="text-xs opacity-70">
          {list.length} players
        </Badge>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => (
          <div key={p.puuid} className="rounded-lg border p-3">
            <div className="mb-1 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  champ {p.championId}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  icon {p.profileIconId}
                </Badge>
              </div>
              {p.bot && (
                <Badge className="text-[10px]" variant="destructive">
                  bot
                </Badge>
              )}
            </div>
            <div className="text-sm font-medium">{short(p.puuid)}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Spells {p.spell1Id} • {p.spell2Id}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GameCard({ g }: { g: FeaturedGameInfoDTOType }) {
  const team100 = React.useMemo(
    () => g.participants.filter((p) => p.teamId === 100),
    [g.participants],
  );
  const team200 = React.useMemo(
    () => g.participants.filter((p) => p.teamId === 200),
    [g.participants],
  );

  const copyKey = async () => {
    try {
      await navigator.clipboard.writeText(g.observers.encryptionKey);
    } catch {
      // ignore clipboard errors
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{g.gameMode}</Badge>
          <Badge variant="outline">{g.gameType}</Badge>
          <Badge variant="secondary">{g.platformId}</Badge>
          <Badge variant="outline" className="ml-auto text-xs">
            ID {g.gameId}
          </Badge>
        </div>
        <CardTitle className="text-lg">Queue {g.gameQueueConfigId}</CardTitle>
        <CardDescription>
          <span className="inline-flex items-center gap-1 mr-3">
            <Clock3 className="h-4 w-4" /> {formatSeconds(g.gameLength)}
          </span>
          <span className="inline-flex items-center gap-1 mr-3">
            <MapPinned className="h-4 w-4" /> map {g.mapId}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gamepad2 className="h-4 w-4" /> players {g.participants.length}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <BansRow bans={g.bannedChampions} />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    void copyKey();
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" /> copy key
                </Button>
              </TooltipTrigger>
              <TooltipContent>observer decryption key</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="participants">
            <AccordionTrigger className="text-sm">
              <div className="inline-flex items-center gap-2">
                <Users className="h-4 w-4" /> show participants
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <ParticipantsTable team={100} list={team100} />
                <ParticipantsTable team={200} list={team200} />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

export default function FeaturedGamesUI({ data }: { data: FeaturedGamesDTOType }) {
  const dataset = data;
  const games = dataset.gameList;

  const [query, setQuery] = React.useState("");
  const [platform, setPlatform] = React.useState<string>("all");
  const [mode, setMode] = React.useState<string>("all");
  const [sort, setSort] = React.useState<"longest" | "shortest">("longest");

  const platforms = React.useMemo(
    () => Array.from(new Set(games.map((g) => g.platformId))),
    [games],
  );
  const modes = React.useMemo(() => Array.from(new Set(games.map((g) => g.gameMode))), [games]);

  const filtered = React.useMemo(() => {
    let arr = [...games];

    if (query.trim()) {
      const q = query.toLowerCase();
      arr = arr.filter((g) => {
        const inRiot = g.participants.some((p) => (p.riotId ?? "").toLowerCase().includes(q));
        const inPuuid = g.participants.some((p) => p.puuid.toLowerCase().includes(q));
        const inIds = `${g.gameId}`.includes(q) || `${g.gameQueueConfigId}`.includes(q);
        return inRiot || inPuuid || inIds;
      });
    }

    if (platform !== "all") arr = arr.filter((g) => g.platformId === platform);
    if (mode !== "all") arr = arr.filter((g) => g.gameMode === mode);

    arr.sort((a, b) =>
      sort === "longest" ? b.gameLength - a.gameLength : a.gameLength - b.gameLength,
    );
    return arr;
  }, [games, query, platform, mode, sort]);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Featured Games</h1>
          </div>
          <div className="ml-auto flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Input
              placeholder="search riot id, puuid, game id"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
              }}
              className="w-full sm:w-[260px]"
            />
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all platforms</SelectItem>
                {platforms.map((p) => (
                  <SelectItem value={p} key={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">all modes</SelectItem>
                {modes.map((m) => (
                  <SelectItem value={m} key={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={sort}
              onValueChange={(v) => {
                setSort(v as typeof sort);
              }}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="longest">longest first</SelectItem>
                <SelectItem value="shortest">shortest first</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Separator className="mt-4" />
      </div>

      <ScrollArea className="h-[70vh] pr-2">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((g) => (
            <GameCard key={g.gameId} g={g} />
          ))}
        </div>
        {!filtered.length && (
          <div className="mt-16 flex flex-col items-center justify-center text-center text-muted-foreground">
            <ShieldQuestion className="mb-2 h-10 w-10" />
            <p className="text-sm">no games match your filters</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
