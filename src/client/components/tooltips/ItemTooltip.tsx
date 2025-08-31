import { RiotTextParser } from "@/client/components/tooltips/RiotTextParser";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/client/components/ui/tooltip";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { useLoaderData } from "@tanstack/react-router";
import React from "react";

type Props = {
  itemId: number;
};

export const ItemTooltip = ({ itemId, children }: React.PropsWithChildren<Props>) => {
  const { items, latest_version } = useLoaderData({ from: "/lol" });
  const [forceOpen, setForceOpen] = React.useState(false);

  if (itemId === 0) return children;

  const item = items[itemId]!;
  const name = item.name;
  const imageUrl = DDragonService.getItemIconUrl(latest_version, itemId);

  return (
    <Tooltip open={forceOpen ? true : undefined}>
      <TooltipTrigger
        asChild
        onClick={() => {
          setForceOpen((t) => !t);
        }}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent className={"border border-neutral-800 flex flex-col gap-1.5"}>
        <div className={"flex items-center gap-2"}>
          <img src={imageUrl} alt={name} className="w-12 aspect-square" />
          <span className="font-medium">{name}</span>
        </div>
        <div className={"text-md"}>
          <RiotTextParser text={item.description} />
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
