import { Tooltip, TooltipContent, TooltipTrigger } from "@/client/components/ui/tooltip";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { useLoaderData } from "@tanstack/react-router";

type Props = {
  championId: number;
};

export const ChampionTooltip = ({ championId, children }: React.PropsWithChildren<Props>) => {
  const { champions, latest_version } = useLoaderData({ from: "__root__" });

  const champion = champions[championId]!;
  const name = champion.name;
  const imageUrl = DDragonService.getChampionIconUrl(latest_version, champion.image.full);

  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className={"border border-neutral-800 flex flex-col gap-1.5 px-2"}>
        <div className={"flex items-center gap-2"}>
          <img src={imageUrl} alt={name} className="w-12 aspect-square" />
          <span className="font-medium text-xl">{name}</span>
          <p className={"italic text-center text-xl"}>{`"${champion.title}"`}</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
};
