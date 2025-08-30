import { RefreshProgressModal } from "@/client/components/refresh/RefreshProgressModal";
import { Button } from "@/client/components/ui/button";
import { friendlyQueueTypeToRiot } from "@/client/lib/typeHelper";
import { getSummonerMatchesKey } from "@/client/queries/getSummonerMatches";
import { progressQueryOptions } from "@/client/queries/refresh/progress-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoaderData, useRouter } from "@tanstack/react-router";
import React from "react";

type Props = {};

export const RefreshSummoner = ({ children }: React.PropsWithChildren<Props>) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });

  const baseOpts = progressQueryOptions({
    puuid: summoner.puuid,
    region: summoner.region,
    queue: friendlyQueueTypeToRiot("solo"),
  });

  const q = useQuery({
    ...baseOpts,
    refetchOnWindowFocus: false,
    enabled: popoverOpen,
  });

  const events = React.useMemo(() => q.data ?? [], [q.data]);

  const handleOnClose = async () => {
    await q.refetch();
    setPopoverOpen(false);
  };

  const handleOnComplete = async () => {
    window.speechSynthesis.speak(new SpeechSynthesisUtterance("done"));
    await router.invalidate().catch(console.error);
    await queryClient.invalidateQueries({
      queryKey: getSummonerMatchesKey({
        queue: "solo",
        summoner: summoner,
      }),
    });
  };

  return (
    <React.Fragment>
      <Button
        variant={"ghost"}
        onClick={() => {
          setPopoverOpen(true);
        }}
        className={"text-muted-foreground"}
      >
        {children}
      </Button>
      <RefreshProgressModal
        isOpen={popoverOpen}
        onClose={() => {
          void handleOnClose();
        }}
        onComplete={() => void handleOnComplete()}
        events={events}
      />
    </React.Fragment>
  );
};
