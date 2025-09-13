import * as React from "react";
import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { cn } from "@/client/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { debounce } from "@tanstack/react-pacer";
import { CDragonService } from "@/shared/services/CDragon/CDragonService";
import { useServerFn } from "@tanstack/react-start";
import { $getSummoners, type $GetSummonersType } from "@/server/functions/$getSummoners";
import { Badge } from "@/client/components/ui/badge";
import { NotebookPenIcon } from "lucide-react";

type Props = {
  onSuccess: (riotId: string) => void;
};

export function RiotIdForm({ onSuccess }: Props) {
  const [value, setValue] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState<number>(-1);
  const $fn = useServerFn($getSummoners);

  const [term, setTerm] = React.useState("");
  const setTermDebounced = debounce(
    (text: string) => {
      setTerm(text.trim());
    },
    { wait: 250 },
  );

  const { data: results = [], isFetching } = useQuery({
    queryKey: ["summoner-suggest", term],
    enabled: term.length >= 2,
    queryFn: async () => await $fn({ data: { c: term } }),
    staleTime: 10_000,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const pick = results[highlight];
    if (pick) onSuccess(pick.summoner.displayRiotId);
    else if (value.trim()) onSuccess(value.trim());
    setOpen(false);
  };

  const handlePick = (s: $GetSummonersType[number]) => {
    onSuccess(s.summoner.displayRiotId);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(results.length - 1, h + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(-1, h - 1));
    } else if (e.key === "Enter") {
      // Let form submit handle selection
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

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
            placeholder="GameName#TagLine"
            className="bg-neutral-900 border-neutral-800 text-neutral-200 placeholder:text-neutral-500"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="riotid-suggestions"
          />

          {open && (isFetching || results.length > 0 || term.length >= 2) ? (
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
              {isFetching ? (
                <div className="px-3 py-2 text-sm text-neutral-400">Searching…</div>
              ) : results.length > 0 ? (
                results.map((s, i) => {
                  const [gameName, tagLine] = s.summoner.displayRiotId.split("#");
                  const active = i === highlight;
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
                        setHighlight(i);
                      }}
                      onClick={() => {
                        handlePick(s);
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
                })
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
