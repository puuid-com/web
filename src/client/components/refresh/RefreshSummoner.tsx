import { RefreshProgressModal } from "@/client/components/refresh/RefreshProgressModal";
import { Button } from "@/client/components/ui/button";
import { friendlyQueueTypeToRiot } from "@/client/lib/typeHelper";
import { progressQueryOptions } from "@/client/queries/refresh/progress-query";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import React from "react";

type Props = {};

export const RefreshSummoner = ({ children }: React.PropsWithChildren<Props>) => {
  const queue = useSearch({ from: "/lol/summoner/$riotID", select: (s) => s.q });
  const [popoverOpen, setPopoverOpen] = React.useState(false);
  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });
  const queryClient = useQueryClient();

  const baseOpts = progressQueryOptions({
    puuid: summoner.puuid,
    region: summoner.region,
    queue: friendlyQueueTypeToRiot(queue),
  });

  const q = useQuery({
    ...baseOpts,
    refetchOnWindowFocus: false,
    enabled: popoverOpen,
  });

  const events = React.useMemo(() => q.data ?? [], [q.data]);

  const handleOnClose = async () => {
    await queryClient.cancelQueries({
      queryKey: baseOpts.queryKey,
    });
    setPopoverOpen(false);
  };

  const handleOnComplete = () => {
    window.location.reload();
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
        onComplete={() => {
          handleOnComplete();
        }}
        events={events}
      />
    </React.Fragment>
  );
};
