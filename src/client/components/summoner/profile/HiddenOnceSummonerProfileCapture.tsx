import React from "react";
import { createPortal } from "react-dom";
import * as htmlToImage from "html-to-image";
import { useMutation } from "@tanstack/react-query";
import { $postSummonerProfile } from "@/server/functions/$postSummonerProfile";
import { SummonerProfileCard } from "@/client/components/summoner/profile/SummonerProfileCard";
import type { SummonerType } from "@/server/db/schema";
import type { MatchWithSummonersType } from "@/server/db/match-schema";
import { toast } from "sonner";

function runWhenIdle(fn: () => Promise<void>): () => void {
  if (typeof window !== "undefined" && typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(() => {
      void fn();
    });
    return () => {
      window.cancelIdleCallback(handle);
    };
  }
  const t = window.setTimeout(() => void fn(), 0);
  return () => {
    window.clearTimeout(t);
  };
}
/* ------------------------------------------------------------------------ */

type Props = {
  summoner: SummonerType;
  matches: MatchWithSummonersType[];
};

export function HiddenOnceSummonerProfileCapture({ summoner, matches }: Props) {
  const [container, setContainer] = React.useState<HTMLDivElement | null>(null);
  const uploadedKey = React.useMemo(() => `spc-uploaded:${summoner.puuid}`, [summoner.puuid]);

  const mutation = useMutation({
    mutationKey: ["summoner-profile", summoner.puuid],
    mutationFn: (data: { imageSrc: string }) =>
      $postSummonerProfile({ data: { puuid: summoner.puuid, imageSrc: data.imageSrc } }),
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

  const shouldRender = container && matches.length;

  // after the hidden clone mounts, capture and upload once
  React.useEffect(() => {
    if (!shouldRender) return;

    let cancelled = false;

    const run = async () => {
      try {
        // wait a tick for images/fonts
        await new Promise((r) => setTimeout(r, 300));

        const node = container.querySelector<HTMLElement>("[data-capture-root]");
        if (!node) return;

        const dataUrl = await htmlToImage.toPng(node, {
          backgroundColor: "transparent",
          cacheBust: true,
          pixelRatio: 2,
        });

        if (cancelled) return;

        await mutation.mutateAsync({ imageSrc: dataUrl });
        toast.success(`Profil ${summoner.riotId} mis à jour`);
      } catch (err) {
        console.error(err instanceof Error ? err : new Error(String(err)));
      } finally {
        container.remove();
        setContainer(null);
      }
    };

    const cancel = runWhenIdle(run);

    return () => {
      cancelled = true;
      cancel();
    };
  }, [container, uploadedKey, mutation, shouldRender, summoner.riotId]);

  if (!shouldRender) return null;

  // render the hidden clone with the effect disabled
  return createPortal(
    <SummonerProfileCard summoner={summoner} matches={matches} disableAutoUpload />,
    container,
  );
}
