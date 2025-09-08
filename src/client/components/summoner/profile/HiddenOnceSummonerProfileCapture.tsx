import React from "react";
import { createPortal } from "react-dom";
import * as htmlToImage from "html-to-image";
import { useMutation } from "@tanstack/react-query";
import { $postSummonerProfile } from "@/server/functions/$postSummonerProfile";
import { SummonerProfileCard } from "@/client/components/summoner/profile/SummonerProfileCard";
import type { MatchWithSummonersType } from "@/server/db/schema/match";
import { useServerFn } from "@tanstack/react-start";
import type { SummonerType } from "@/server/db/schema/summoner";

function runWhenIdle(fn: () => Promise<void>): () => void {
  /* if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(() => {
      void fn();
    });
    return () => {
      window.cancelIdleCallback(handle);
    };
  } */
  const t = window.setTimeout(() => void fn(), 0);
  return () => {
    window.clearTimeout(t);
  };
}
/* ------------------------------------------------------------------------ */

type Props = {
  summoner: SummonerType;
  matches: MatchWithSummonersType[];
  onSuccessCallback?: () => void;
  onStartCallback?: () => void;
};

function HiddenOnceSummonerProfileCapture({
  summoner,
  matches,
  onSuccessCallback,
  onStartCallback,
}: Props) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const uploadedKey = React.useMemo(() => `spc-uploaded:${summoner.puuid}`, [summoner.puuid]);
  const _$postSummonerProfile = useServerFn($postSummonerProfile);

  const { mutateAsync } = useMutation({
    mutationKey: ["summoner-profile", summoner.puuid],
    mutationFn: (data: { imageSrc: string }) =>
      _$postSummonerProfile({ data: { puuid: summoner.puuid, imageSrc: data.imageSrc } }),
  });

  // create the off-screen container only if we have not uploaded yet
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    el.style.position = "fixed";
    el.style.top = "-100000px";
    el.style.left = "-100000px";
    el.style.width = "480px";
    el.style.pointerEvents = "none";
    el.style.opacity = "0";
    document.body.appendChild(el);
    setContainer(el);

    return () => {
      el.remove();
    };
  }, [uploadedKey]);

  const shouldRender = React.useMemo(() => {
    return container && matches.length;
  }, [container, matches.length]);

  // after the hidden clone mounts, capture and upload once
  React.useEffect(() => {
    if (!shouldRender) return;

    let cancelled = false;

    const run = async () => {
      try {
        // wait a tick for images/fonts
        await new Promise((r) => setTimeout(r, 300));

        const node = container!.querySelector<HTMLElement>("[data-capture-root]");
        if (!node) return;

        onStartCallback?.();

        if (cancelled) return;

        const dataUrl = await htmlToImage.toPng(node, {
          backgroundColor: "transparent",
          cacheBust: true,
          pixelRatio: 2,
        });

        await mutateAsync({ imageSrc: dataUrl });

        onSuccessCallback?.();
      } catch (err) {
        console.error(err instanceof Error ? err : new Error(String(err)));
      } finally {
        container!.remove();
        setContainer(null);
      }
    };

    const cancel = runWhenIdle(run);

    return () => {
      cancelled = true;
      cancel();
    };
  }, [
    container,
    uploadedKey,
    shouldRender,
    summoner.riotId,
    onSuccessCallback,
    onStartCallback,
    mutateAsync,
  ]);

  if (!shouldRender) return null;

  // render the hidden clone with the effect disabled
  return createPortal(
    <SummonerProfileCard summoner={summoner} matches={matches} disableAutoUpload />,
    container!,
  );
}

export const SummonerProfileCapture = React.memo(HiddenOnceSummonerProfileCapture, (prev, next) => {
  const a = prev.matches;
  const b = next.matches;

  const aIds = a
    .map((m) => m.matchId)
    .sort()
    .join();
  const bIds = b
    .map((m) => m.matchId)
    .sort()
    .join();

  return aIds === bIds;
});
