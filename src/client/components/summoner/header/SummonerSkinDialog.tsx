import { Button } from "@/client/components/ui/button";
import {
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Sheet,
} from "@/client/components/ui/sheet";
import { useMainChampionContext } from "@/client/context/MainChampionContext";
import { useGetChampionData } from "@/client/hooks/useChampionData";
import { ClientColorsService } from "@/client/service/ClientColorsService";
import { $changeMainChampionColors } from "@/server/functions/$changeMainChampionColors";
import { CDragonService } from "@puuid/core/shared/services/CDragonService";
import { useMutation } from "@tanstack/react-query";
import { useLoaderData } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { CatIcon, RotateCcwIcon, ScanEyeIcon } from "lucide-react";
import React from "react";
import { toast } from "sonner";

type Props = {};

export const SummonerSkinDialog = ({}: Props) => {
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });

  const [isOpen, setIsOpen] = React.useState(false);
  const {
    handleTempColorChange,
    handleTempColorReset,
    backgroundColor,
    foregroundColor,
    handleSaveTempData,
  } = useMainChampionContext();
  const [skinId, setSkinId] = React.useState<number | undefined>(undefined);

  const { queueStats } = useLoaderData({
    from: "/lol/summoner/$riotID",
  });

  const { data } = useGetChampionData(summoner.mainChampionId ?? undefined, isOpen);
  const $m = useServerFn($changeMainChampionColors);

  const q_m = useMutation({
    mutationFn: () => {
      if (!queueStats) {
        throw new Error("No queue stats");
      }

      if (!skinId) {
        throw new Error("No skin id");
      }

      return $m({
        data: {
          puuid: summoner.puuid,
          skinId: skinId,
        },
      });
    },
    onSuccess: () => {
      handleSaveTempData();
      setIsOpen(false);
      toast.success("Colors changed");
    },
  });

  const championId = queueStats?.summonerStatistic?.mainChampionId;

  const handleSkinSelection = async (newSkinId: number) => {
    if (!championId) {
      throw new Error("No champion id");
    }

    setSkinId(newSkinId);

    const { backgroundColor, foregroundColor } =
      await ClientColorsService.getMainColorsFromChampionSkin(championId, newSkinId);

    if (!backgroundColor || !foregroundColor) {
      throw new Error("No colors");
    }

    handleTempColorChange(backgroundColor, foregroundColor, newSkinId);
  };

  const handleOnOpenChange = (open: boolean) => {
    if (!open) {
      handleTempColorReset();
    }

    setIsOpen(open);
  };

  const handleReset = () => {
    setSkinId(undefined);
    handleTempColorReset();
  };

  if (!championId) return null;

  return (
    <Sheet open={isOpen} onOpenChange={handleOnOpenChange}>
      <SheetTrigger
        className={
          "opacity-75 hover:opacity-100 transition-opacity px-1.5 rounded flex items-center  gap-1 text-[10px] cursor-pointer bg-main/20 "
        }
      >
        <ScanEyeIcon className={"w-2"} />
        Edit
      </SheetTrigger>
      <SheetContent
        style={
          {
            "--color-main": backgroundColor ?? undefined,
            "--color-main-foreground": foregroundColor ?? undefined,
          } as React.CSSProperties
        }
      >
        <SheetHeader>
          <SheetTitle>Are you absolutely sure?</SheetTitle>
          <SheetDescription>
            This action cannot be undone. This will permanently delete your account and remove your
            data from our servers.
          </SheetDescription>
        </SheetHeader>
        <div className={"relative flex flex-col overflow-auto"}>
          <div className={"grid grid-cols-1 gap-2 overflow-auto"}>
            {data?.skins.map((skin) => {
              return (
                <button
                  key={skin.id}
                  onClick={() => {
                    void handleSkinSelection(skin.num);
                  }}
                >
                  <div className={"font-bold text-center"}>{skin.name}</div>
                  <img
                    src={CDragonService.getChampionPortraitSkin(data.id, skin.num)}
                    alt=""
                    className={"w-full"}
                  />
                </button>
              );
            })}
          </div>
          <div className={"flex items-center justify-center absolute bottom-0 w-full my-5 gap-2.5"}>
            <Button
              onClick={() => {
                q_m.mutate();
              }}
              className={"bg-main text-main-foreground"}
              disabled={skinId === undefined}
            >
              <CatIcon />
              Save
            </Button>
            <Button
              onClick={handleReset}
              className={"bg-main text-main-foreground"}
              disabled={skinId === undefined}
            >
              <RotateCcwIcon />
              Reset
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
