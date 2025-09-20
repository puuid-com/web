import React from "react";
import type { $getMatchDetailsType } from "@/server/functions/$getMatchDetails";
import type { GetSummonerMatchesType } from "@/client/queries/getSummonerMatches";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";

type Match = GetSummonerMatchesType["data"][number];

type Props = {
  match: Match;
  timeline: NonNullable<$getMatchDetailsType>;
  selectedPuuid?: string | null;
};

export const MatchDetailsSkills: React.FC<Props> = ({ match, timeline, selectedPuuid }) => {
  // participants mapping puuid -> participantId
  const mapping =
    timeline.info.participants?.reduce((acc: Map<string, number>, p) => {
      acc.set(p.puuid, p.participantId);
      return acc;
    }, new Map<string, number>()) ?? null;

  const participants = match.summoners.map((s) => ({
    puuid: s.puuid,
    participantId: mapping?.get(s.puuid) ?? null,
    championId: s.championId,
  }));

  const selected =
    participants.find((p) => p.puuid === (selectedPuuid ?? participants[0]?.puuid ?? null)) ??
    participants[0] ??
    null;

  const pid = selected?.participantId ?? null;
  const championId = selected?.championId ?? null;

  // Extract skill level-up events for the selected participant in chronological order
  const skillByLevel = React.useMemo(() => {
    const out: (1 | 2 | 3 | 4 | null)[] = Array.from({ length: 19 }, () => null); // 0..18, use 1..18
    if (!pid) return out;
    type SkillEv = {
      type: "SKILL_LEVEL_UP";
      timestamp: number;
      participantId: number;
      skillSlot: number;
    };
    const events: SkillEv[] = [];
    for (const f of timeline.info.frames) {
      for (const e of f.events) {
        if (e.type === "SKILL_LEVEL_UP" && !("_isUnknown" in e) && e.participantId === pid) {
          const ev = e as unknown as SkillEv;
          events.push(ev);
        }
      }
    }
    events.sort((a, b) => a.timestamp - b.timestamp);
    let levelIdx = 1; // assign first skill to level 1, then 2..18
    for (const ev of events) {
      if (levelIdx > 18) break;
      const slot = ev.skillSlot as 1 | 2 | 3 | 4;
      out[levelIdx] = slot;
      levelIdx++;
    }
    return out;
  }, [pid, timeline.info.frames]);

  const spells = [
    { label: "Q", slot: 1 as const, key: "q" },
    { label: "W", slot: 2 as const, key: "w" },
    { label: "E", slot: 3 as const, key: "e" },
    { label: "R", slot: 4 as const, key: "r" },
  ];

  if (!pid)
    return (
      <div className="text-sm text-muted-foreground">
        Timeline participant mapping not available.
      </div>
    );

  const headerCells = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div className="flex flex-col gap-2">
      {/* Header: empty corner + levels 1..18 */}
      <div className="flex items-center gap-1">
        <div className="w-7" />
        {headerCells.map((lvl) => (
          <div
            key={`h-${lvl}`}
            className="w-5 text-[10px] leading-none text-muted-foreground text-center select-none"
          >
            {lvl}
          </div>
        ))}
      </div>

      {/* Rows: Q/W/E/R */}
      <div className="flex flex-col gap-1">
        {spells.map((s) => (
          <div key={s.slot} className="flex items-center gap-1">
            <div className="w-7 h-7 relative rounded-sm overflow-hidden ring-1 ring-border/60 bg-input/20">
              {championId != null ? (
                <img
                  src={CDragonService.getChampionSpell(championId, s.key)}
                  alt={`${s.label} ability`}
                  className="w-full h-full object-cover"
                />
              ) : null}
              <span className="absolute bottom-0 right-0 px-1 rounded-tl-[3px] text-[10px] leading-none ring-1 ring-border/50 bg-background/90">
                {s.label}
              </span>
            </div>
            {headerCells.map((lvl) => {
              const active = skillByLevel[lvl] === s.slot;
              return (
                <div
                  key={`${s.slot}-${lvl}`}
                  className={
                    "w-5 h-5 rounded-[3px] ring-1 flex items-center justify-center " +
                    (active
                      ? "bg-main/70 ring-main text-main-foreground"
                      : "bg-transparent ring-border/40")
                  }
                  title={`${s.label} at level ${lvl}${active ? " (leveled)" : ""}`}
                >
                  {active ? (
                    <span className="text-[10px] leading-none font-mono">{lvl}</span>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
