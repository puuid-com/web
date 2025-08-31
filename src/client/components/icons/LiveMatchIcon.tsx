"use client";

import { forwardRef } from "react";
import { RadioIcon } from "lucide-react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/client/lib/utils";
import { useIsInAcitveMatch } from "@/client/hooks/useIsInAcitveMatch";
import { useRouteContext } from "@tanstack/react-router";

interface LiveMatchIconProps extends LucideProps {}

export const LiveMatchIcon = forwardRef<SVGSVGElement, LiveMatchIconProps>(
  ({ className, ...props }, ref) => {
    const { summoner } = useRouteContext({ from: "/lol/summoner/$riotID" });
    const isActive = useIsInAcitveMatch({
      puuid: summoner.puuid,
      region: summoner.region,
    });

    return (
      <RadioIcon
        ref={ref}
        className={cn(
          "transition-all duration-300",
          isActive && "animate-pulse",
          isActive && "text-main",
          !isActive && "text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);

LiveMatchIcon.displayName = "GameStatusIcon";
