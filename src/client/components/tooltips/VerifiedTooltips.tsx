import { Badge } from "@/client/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/client/components/ui/tooltip";
import type { SummonerWithRelationsType } from "@/server/db/schema";
import { BadgeCheckIcon } from "lucide-react";

type Props = {
  summoner: SummonerWithRelationsType;
};

export const VerifiedTooltips = ({ summoner }: Props) => {
  if (!summoner.verifiedUserId || !summoner.verifiedUser) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge variant={"icon"} className={"bg-main"}>
          <BadgeCheckIcon strokeWidth={3} />
        </Badge>
      </TooltipTrigger>
      <TooltipContent className={"border border-neutral-800 flex flex-col gap-1.5"}>
        <div>This account is verified by {summoner.verifiedUser.name}.</div>
      </TooltipContent>
    </Tooltip>
  );
};
