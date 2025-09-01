import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/client/components/ui/dialog";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { useLoaderData } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";

type Props = {};

export const SummonerHeaderInfo = ({}: Props) => {
  const metadata = useLoaderData({ from: "/lol" });
  const { queueStats } = useLoaderData({
    from: "/lol/summoner/$riotID",
  });

  if (!queueStats?.mainChampionId) return null;

  return (
    <Dialog>
      <DialogTrigger
        className={
          "opacity-75 hover:opacity-100 transition-opacity px-1.5 rounded flex items-center  gap-1 text-[10px] cursor-pointer bg-main/20 "
        }
      >
        <InfoIcon className={"w-2"} />
        Why do I see {DDragonService.getChampionName(
          metadata.champions,
          queueStats.mainChampionId,
        )}{" "}
        ?
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Summoner Champion Header</DialogTitle>
          <DialogDescription className={"flex flex-col"}>
            <div>
              <h2 className={"font-bold text-neutral-300 text-base"}>Image</h2>
              <p>
                The champion displayed in the header is the champion that has the most matches in{" "}
                <span className={"font-bold"}>Ranked Solo/Duo queue</span> for the summoner.
              </p>
            </div>
            <div className={"mt-5"}>
              <h2 className={"font-bold text-neutral-300 text-base"}>Colors</h2>
              <p>
                As for the colors, they are inferred from the champion's{" "}
                <span className={"font-bold"}>loading screen image</span>.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
