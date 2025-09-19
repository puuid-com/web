import { ChampionTooltip } from "@/client/components/tooltips/ChampionTooltip";
import { cn } from "@/client/lib/utils";
import type { LolPositionType } from "@puuid/core/server/api-route/riot/match/MatchDTO";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { CDNService } from "@puuid/core/shared/services/CDNService";
import { Badge } from "@/client/components/ui/badge";
import React from "react";

type Props = {
  championId: number;
  championName?: string;
  spell1Url: string;
  spell2Url: string;
  role: LolPositionType;
  teamId: number; // 100 | 200
  isSelf?: boolean;
};

export const ChampionTile = React.memo(function ChampionTile({
  championId,
  championName = "",
  spell1Url,
  spell2Url,
  role,
  teamId,
  isSelf = false,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1.5 min-w-14 transition-transform",
        "hover:scale-[1.02]",
      )}
    >
      <ChampionTooltip championId={championId}>
        <div className={cn("relative rounded-md", isSelf && "ring-2 ring-main/70")}>
          <img
            className={"w-14 h-14 aspect-square rounded-md object-cover"}
            src={CDragonService.getChampionSquare(championId)}
            alt={championName}
            loading="eager"
            decoding="async"
          />
          {/* Position icon overlay: half outside, in a badge */}
          <Badge
            variant={"icon"}
            className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10",
              "ring-1 ring-border/60 shadow-sm backdrop-blur-[1px]",
              teamId === 100
                ? "bg-red-500/60 border-red-500/60 text-red-50"
                : "bg-blue-500/60 border-blue-500/60 text-blue-50",
            )}
            title={role}
          >
            <img
              src={CDNService.getPositionImageUrl(role)}
              alt=""
              aria-hidden="true"
              className={"w-3 h-3"}
              loading="eager"
              decoding="async"
            />
          </Badge>
          <div className={"absolute bottom-0 right-0 flex gap-0.5 p-0.5"}>
            <img
              src={spell1Url}
              alt=""
              className={"w-4 h-4 aspect-square rounded-sm ring-1 ring-border/40"}
            />
            <img
              src={spell2Url}
              alt=""
              className={"w-4 h-4 aspect-square rounded-sm ring-1 ring-border/40"}
            />
          </div>
        </div>
      </ChampionTooltip>
    </div>
  );
});
