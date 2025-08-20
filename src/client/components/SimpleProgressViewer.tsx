import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/client/components/ui/dialog";
import { Button } from "@/client/components/ui/button";
import { Badge } from "@/client/components/ui/badge";
import { Progress } from "@/client/components/ui/progress";
import { Loader2, CheckCircle2, Circle } from "lucide-react";

import type { SummonerType } from "@/server/db/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { SimpleProgressMsg } from "@/server/functions/$streamSimpleProgress";
import { toast } from "sonner";
import { progressQueryOptions } from "@/client/queries/refresh/progress-query";

type SimpleProgressDialogProps = {
  summoner: SummonerType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const stepsOrder = [
  "fetching_summoner",
  "fetching_matches",
  "fetching_leagues",
  "fetching_stats",
] as const;

type StepKey = (typeof stepsOrder)[number];
type StepState = "pending" | "active" | "done";

const initialStepStatus: Record<StepKey, StepState> = {
  fetching_summoner: "pending",
  fetching_matches: "pending",
  fetching_leagues: "pending",
  fetching_stats: "pending",
};

function reduceProgress(events: SimpleProgressMsg[]) {
  let status: "idle" | SimpleProgressMsg["status"] = events.length
    ? events.at(-1)!.status
    : "idle";
  let stepStatus: Record<StepKey, StepState> = { ...initialStepStatus };
  let currentStep: StepKey | null = null;
  let totalMatches: number | null = null;
  let fetchedMatches = 0;

  for (const ev of events) {
    if (ev.status !== "in_progress") continue;
    const step = (ev as any).step as StepKey;
    if (!step) continue;
    if (stepStatus[step] === "pending") stepStatus[step] = "active";
    currentStep = step;
    if (step === "fetching_matches") {
      if ("matchesToFetch" in ev) totalMatches = ev.matchesToFetch;
      if ("matchesFetched" in ev) fetchedMatches += ev.matchesFetched;
    }
  }

  if (currentStep) {
    for (const s of stepsOrder) {
      if (s === currentStep) break;
      if (stepStatus[s] !== "pending") stepStatus[s] = "done";
    }
  }

  if (status === "finished") {
    for (const s of stepsOrder) stepStatus[s] = "done";
    currentStep = null;
  }

  const perStep = 100 / stepsOrder.length;
  const finishedSteps =
    stepsOrder.filter((s) => stepStatus[s] === "done").length * perStep;
  const partial =
    currentStep === "fetching_matches" && totalMatches && totalMatches > 0
      ? Math.min(1, fetchedMatches / totalMatches) * perStep
      : 0;

  const overallPercent = Math.min(100, Math.round(finishedSteps + partial));
  return {
    status,
    stepStatus,
    currentStep,
    totalMatches,
    fetchedMatches,
    overallPercent,
  };
}

const stepLabel = (s: StepKey) =>
  s === "fetching_summoner"
    ? "Profil invocateur"
    : s === "fetching_matches"
      ? "Matchs"
      : s === "fetching_leagues"
        ? "Ligues"
        : "Statistiques";

export function SimpleProgressDialog({
  summoner,
  open,
  onOpenChange,
}: SimpleProgressDialogProps) {
  const qc = useQueryClient();
  const queue = "";

  const q = useQuery({
    ...progressQueryOptions({
      puuid: summoner.puuid,
      region: summoner.region,
      queue,
    }),
    enabled: open,
  });

  const events = q.data ?? [];
  const {
    status,
    stepStatus,
    currentStep,
    totalMatches,
    fetchedMatches,
    overallPercent,
  } = React.useMemo(() => reduceProgress(events), [events]);

  const statusBadgeClass =
    status === "finished"
      ? "bg-emerald-900 text-emerald-200"
      : q.fetchStatus === "fetching"
        ? "bg-zinc-800 text-zinc-200"
        : "bg-zinc-800 text-zinc-200";

  const renderStepIcon = (s: StepKey) => {
    const st = stepStatus[s];
    if (st === "done")
      return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (st === "active")
      return <Loader2 className="h-4 w-4 animate-spin text-zinc-200" />;
    return <Circle className="h-4 w-4 text-zinc-600" />;
  };

  const handleClose = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      qc.removeQueries({
        queryKey: ["summoner-progress", summoner.puuid, summoner.region, queue],
      });
      if (status === "finished") {
        toast.success(`Summoner ${summoner.riotId} refreshed successfully`);
      }
    }
  };

  const handleCancel = () => handleClose(false);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md border-zinc-800 bg-zinc-950 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {q.fetchStatus === "fetching" && status !== "finished" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            Mise à jour du profil
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Synchronisation des données, restez sur la page
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">statut</span>
            <Badge variant="secondary" className={statusBadgeClass}>
              {status === "idle" ? "pending" : status}
            </Badge>
          </div>

          {currentStep === "fetching_matches" && totalMatches !== null ? (
            <div className="text-sm tabular-nums">
              {fetchedMatches}
              {"/"}
              {totalMatches}
            </div>
          ) : (
            <div className="text-sm text-zinc-400">
              {currentStep ? stepLabel(currentStep) : "\u00A0"}
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Progress value={overallPercent} className="h-2 bg-zinc-900" />

          <ol className="space-y-2">
            {stepsOrder.map((s) => (
              <li key={s} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderStepIcon(s)}
                  <span
                    className={
                      stepStatus[s] === "done"
                        ? "text-emerald-200"
                        : stepStatus[s] === "active"
                          ? "text-zinc-100"
                          : "text-zinc-500"
                    }
                  >
                    {stepLabel(s)}
                  </span>
                </div>

                {s === "fetching_matches" && totalMatches !== null ? (
                  <span className="text-xs tabular-nums text-zinc-400">
                    {Math.min(
                      100,
                      Math.round(
                        (fetchedMatches / Math.max(1, totalMatches)) * 100
                      )
                    )}
                    %
                  </span>
                ) : (
                  <span className="text-xs text-zinc-400">
                    {stepStatus[s] === "done"
                      ? "terminé"
                      : stepStatus[s] === "active"
                        ? "en cours"
                        : "en attente"}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>

        <DialogFooter className="flex items-center justify-end gap-2">
          {status === "finished" ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleClose(false)}
            >
              Fermer
            </Button>
          ) : (
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              Annuler
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
