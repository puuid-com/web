import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useLoaderData } from "@tanstack/react-router";
import { Badge } from "@/client/components/ui/badge";
import { Button } from "@/client/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Progress } from "@/client/components/ui/progress";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { toast } from "sonner";

import type { SummonerType } from "@/server/db/schema";
import { progressQueryOptions } from "@/client/queries/refresh/progress-query";
import type { RefreshProgressMsgType, StepsType } from "@/server/services/refresh";
import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";

export const Route = createFileRoute("/lol/summoner/$riotID/refresh")({
  component: RouteComponent,
});

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

function reduceProgress(events: RefreshProgressMsgType[]) {
  let globalStatus: "idle" | "started" | "finished" = "idle";
  const stepStatus: Record<StepKey, StepState> = { ...initialStepStatus };
  let currentStep: StepKey | null = null;
  let totalMatches: number | null = null;
  let fetchedMatches = 0;

  for (const ev of events) {
    if (ev.status === "started") {
      globalStatus = "started";
      continue;
    }
    if (ev.status === "finished") {
      globalStatus = "finished";
      continue;
    }

    // Step events
    const step = (ev as StepsType).step as StepKey | undefined;
    if (!step) continue;

    if (ev.status === "step_started") {
      // mark previous steps as done
      for (const s of stepsOrder) {
        if (s === step) break;
        if (stepStatus[s] !== "done") stepStatus[s] = "done";
      }
      stepStatus[step] = "active";
      currentStep = step;
      continue;
    }

    if (ev.status === "step_in_progress") {
      if (stepStatus[step] === "pending") stepStatus[step] = "active";
      currentStep = step;
      if (step === "fetching_matches") {
        if ("matchesToFetch" in ev) totalMatches = ev.matchesToFetch;
        if ("matchesFetched" in ev) fetchedMatches += ev.matchesFetched;
      }
      continue;
    }

    stepStatus[step] = "done";
    if (currentStep === step) currentStep = null;
    continue;
  }

  if (globalStatus === "finished") {
    for (const s of stepsOrder) stepStatus[s] = "done";
    currentStep = null;
  }

  const perStep = 100 / stepsOrder.length;
  const finishedSteps = stepsOrder.filter((s) => stepStatus[s] === "done").length * perStep;
  const partial =
    currentStep === "fetching_matches" && totalMatches && totalMatches > 0
      ? Math.min(1, fetchedMatches / totalMatches) * perStep
      : 0;

  const overallPercent = Math.min(100, Math.round(finishedSteps + partial));

  return {
    status: globalStatus,
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

export type SimpleProgressPageProps = {
  summoner: SummonerType;
  queue?: string;
};

function RouteComponent() {
  const [enable, setEnable] = React.useState(false);

  const { summoner } = useLoaderData({
    from: "/lol/summoner/$riotID",
  });
  const { queue } = { queue: "RANKED_SOLO_5x5" as LolQueueType };

  const qc = useQueryClient();

  const q = useQuery({
    ...progressQueryOptions({
      puuid: summoner.puuid,
      region: summoner.region,
      queue,
    }),
    refetchOnWindowFocus: false,
    enabled: enable,
  });

  const events = React.useMemo(() => q.data ?? [], [q.data]);

  const { status, stepStatus, currentStep, totalMatches, fetchedMatches, overallPercent } =
    React.useMemo(() => reduceProgress(events), [events]);

  const statusBadgeClass =
    status === "finished"
      ? "bg-emerald-900 text-emerald-200"
      : q.fetchStatus === "fetching" || status === "started"
        ? "bg-zinc-800 text-zinc-200"
        : "bg-zinc-800 text-zinc-200";

  const renderStepIcon = (s: StepKey) => {
    const st = stepStatus[s];
    if (st === "done") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    if (st === "active") return <Loader2 className="h-4 w-4 animate-spin text-zinc-200" />;
    return <Circle className="h-4 w-4 text-zinc-600" />;
  };

  const handleCancel = () => {
    qc.removeQueries({
      queryKey: ["summoner-progress", summoner.puuid, summoner.region, queue],
    });
    toast.info(`Mise à jour annulée pour ${summoner.riotId}`);
  };

  const handleAcknowledge = () => {
    qc.removeQueries({
      queryKey: ["summoner-progress", summoner.puuid, summoner.region, queue],
    });
    if (status === "finished") toast.success(`Profil ${summoner.riotId} synchronisé`);
  };

  return (
    <div className="relative bg-zinc-950 text-zinc-100 flex-1">
      <Button
        onClick={() => {
          setEnable(true);
        }}
      >
        Refresh :)
      </Button>
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-10 border-b border-zinc-900/60 backdrop-blur supports-[backdrop-filter]:bg-zinc-950/70">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            {q.fetchStatus === "fetching" && status !== "finished" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : null}
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Mise à jour du profil</h1>
              <p className="text-xs text-zinc-400">
                Synchronisation des données, restez sur la page
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={statusBadgeClass}>
              {status === "idle" ? "pending" : status}
            </Badge>
            {status === "finished" ? (
              <Button size="sm" variant="secondary" asChild>
                <Link
                  to={`/lol/summoner/$riotID`}
                  params={{
                    riotID: summoner.riotId.replace(/#/g, "-"),
                  }}
                  search={{
                    queue: "RANKED_SOLO_5x5",
                  }}
                >
                  Retour au profil
                </Link>
              </Button>
            ) : (
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                Annuler
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-5xl grid-cols-1 gap-6 px-4 py-8 md:grid-cols-5">
        <section className="md:col-span-3">
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span>Progression globale</span>
                <span className="text-sm tabular-nums text-zinc-400">{overallPercent}%</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={overallPercent} className="h-2 bg-zinc-900" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
                  <div className="text-zinc-400">Étape en cours</div>
                  <div className="mt-1 font-medium">
                    {currentStep
                      ? stepLabel(currentStep)
                      : status === "finished"
                        ? "Terminé"
                        : status === "started"
                          ? "En cours"
                          : "En attente"}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
                  <div className="text-zinc-400">Statut</div>
                  <div className="mt-1 font-medium">{status === "idle" ? "pending" : status}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 border-zinc-800 bg-zinc-900/40">
            <CardHeader>
              <CardTitle>Étapes</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {stepsOrder.map((s) => (
                  <li key={s} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                          Math.round((fetchedMatches / Math.max(1, totalMatches)) * 100),
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
            </CardContent>
          </Card>
        </section>

        <aside className="md:col-span-2">
          <Card className="border-zinc-800 bg-zinc-900/40">
            <CardHeader>
              <CardTitle>Invocateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Riot ID</span>
                <span className="font-medium">{summoner.riotId}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Région</span>
                <span className="font-medium">{summoner.region}</span>
              </div>
              {currentStep === "fetching_matches" && totalMatches !== null ? (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
                  <div className="text-sm text-zinc-400">Téléchargement des matchs</div>
                  <div className="mt-1 text-sm tabular-nums">
                    {fetchedMatches}/{totalMatches}
                  </div>
                  <Progress
                    value={Math.min(
                      100,
                      Math.round((fetchedMatches / Math.max(1, totalMatches)) * 100),
                    )}
                    className="mt-2 h-1.5 bg-zinc-900"
                  />
                </div>
              ) : null}

              {status === "finished" ? (
                <div className="rounded-xl border border-emerald-800 bg-emerald-950/40 p-3">
                  <div className="flex items-center gap-2 text-emerald-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Synchronisation terminée</span>
                  </div>
                  <div className="mt-2">
                    <Button className="w-full" variant="secondary" asChild>
                      <Link
                        to={`/lol/summoner/$riotID`}
                        params={{
                          riotID: summoner.riotId.replace(/#/g, "-"),
                        }}
                        search={{
                          queue: "RANKED_SOLO_5x5",
                        }}
                        onClick={handleAcknowledge}
                      >
                        Voir le profil
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-3">
                  <div className="text-sm text-zinc-400">Besoin d’interrompre</div>
                  <div className="mt-2 flex items-center gap-2">
                    <Button variant="ghost" onClick={handleCancel}>
                      Annuler
                    </Button>
                    <Button variant="secondary" asChild>
                      <Link
                        to={`/lol/summoner/$riotID`}
                        params={{
                          riotID: summoner.riotId.replace(/#/g, "-"),
                        }}
                        search={{
                          queue: "RANKED_SOLO_5x5",
                        }}
                      >
                        Retour
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </main>
    </div>
  );
}
