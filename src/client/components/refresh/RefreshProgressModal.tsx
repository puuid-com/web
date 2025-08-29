"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/client/components/ui/dialog";
import { Progress } from "@/client/components/ui/progress";
import { Badge } from "@/client/components/ui/badge";
import {
  CheckCircle,
  Loader2,
  User,
  Trophy,
  BarChart3,
  GamepadIcon,
  ContactIcon,
} from "lucide-react";
import type { RefreshProgressMsgType } from "@/server/services/refresh";
import React from "react";
import { DialogDescription } from "@radix-ui/react-dialog";
import { useLoaderData } from "@tanstack/react-router";
import { SummonerProfileCapture } from "@/client/components/summoner/profile/HiddenOnceSummonerProfileCapture";
import type { MatchWithSummonersType } from "@/server/db/match-schema";

interface RefreshProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  events: _RefreshProgressMsgType[];
}

type UIStepStatus = "completed" | "active" | "pending";

const STEPS = [
  {
    key: "fetching_summoner",
    label: "Fetching Summoner",
    description: "Getting summoner profile data",
    icon: User,
    status: "pending" as UIStepStatus,
  },
  {
    key: "fetching_matches",
    label: "Fetching Matches",
    description: "Downloading match history",
    icon: GamepadIcon,
    status: "pending" as UIStepStatus,
    matchProgress: {
      fetched: 0,
      total: 0,
    },
  },
  {
    key: "fetching_leagues",
    label: "Fetching Leagues",
    description: "Getting rank information",
    icon: Trophy,
    status: "pending" as UIStepStatus,
  },
  {
    key: "fetching_stats",
    label: "Fetching Stats",
    description: "Calculating statistics",
    icon: BarChart3,
    status: "pending" as UIStepStatus,
  },
  {
    key: "fetching_profile",
    label: "Saving Profile",
    description: "Updating profile image",
    icon: ContactIcon,
    status: "pending" as UIStepStatus,
  },
] as const;

type _RefreshProgressMsgType =
  | RefreshProgressMsgType
  | {
      step: "fetching_profile";
      status: "step_started" | "step_finished" | "step_in_progress";
    };

function getStepStatus(
  stepKey: string,
  progressMessages: _RefreshProgressMsgType[],
): "completed" | "active" | null {
  const stepMessages = progressMessages.filter((p) => "step" in p && p.step === stepKey);

  if (stepMessages.some((p) => p.status === "step_finished")) return "completed";
  else if (stepMessages.some((p) => p.status === "step_in_progress")) return "active";
  else if (stepMessages.some((p) => p.status === "step_started")) return "active";
  else return null;
}

export function RefreshProgressModal({
  isOpen,
  onClose,
  events,
  onComplete,
}: RefreshProgressModalProps) {
  const isCompletedRef = React.useRef(false);
  const [progressMessages, setProgressMessages] = useState<_RefreshProgressMsgType[]>([]);
  const [customEvents, setCustomEvents] = useState<_RefreshProgressMsgType[]>([]);

  React.useEffect(() => {
    setProgressMessages([...events, ...customEvents]);
  }, [customEvents, events]);

  const { summoner } = useLoaderData({ from: "/lol/summoner/$riotID" });

  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchWithSummonersType[]>([]);
  const [matchProgress, setMatchProgress] = useState<{
    fetched: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    const latestMessage = progressMessages[progressMessages.length - 1];
    if (!latestMessage) return;

    if (latestMessage.status === "started") {
      setCurrentStep(null);
      setMatchProgress(null);
    } else if (latestMessage.status === "finished") {
      setCurrentStep(null);

      const last5Matches = latestMessage.lastMatches.slice(0, 5);

      setMatches(last5Matches);

      /**
       * No matches, so the profil will not actually renders, so we mock the refresh.
       */
      if (!last5Matches.length) {
        handleOnStartProfileCapture();

        setTimeout(() => {
          handleOnSuccessProfileCapture();
        }, 1500);
      }
    } else if ("step" in latestMessage) {
      const { step, status } = latestMessage;

      if (status === "step_started") {
        setCurrentStep(step);
      } else if (status === "step_finished") {
        setCurrentStep(null);
      } else {
        setCurrentStep(step);

        if (step === "fetching_matches") {
          if ("matchesToFetch" in latestMessage) {
            setMatchProgress((prev) => ({
              fetched: prev?.fetched ?? 0,
              total: latestMessage.matchesToFetch,
            }));
          } else if ("matchesFetched" in latestMessage) {
            setMatchProgress((prev) => ({
              fetched: (prev?.fetched ?? 0) + latestMessage.matchesFetched,
              total: prev?.total ?? latestMessage.matchesFetched,
            }));
          }
        }
      }
    }
  }, [progressMessages]);

  const steps = React.useMemo(() => {
    return STEPS.map((step) => {
      const status = getStepStatus(step.key, progressMessages);

      if (step.key === "fetching_matches") {
        return {
          ...step,
          status,
          matchProgress,
        };
      }

      return {
        ...step,
        status,
      };
    });
  }, [matchProgress, progressMessages]);

  React.useEffect(() => {
    console.log(progressMessages);
  }, [progressMessages]);

  const isComplete = React.useMemo(() => {
    const _isComplete = steps.every((s) => s.status === "completed");

    if (_isComplete && !isCompletedRef.current) {
      isCompletedRef.current = true;
      onComplete();
    }

    return _isComplete;
  }, [onComplete, steps]);

  const getOverallProgress = () => {
    if (isComplete) return 100;
    const totalSteps = steps.length;
    const completed = steps.filter((s) => s.status === "completed").length;
    const current = currentStep ? 1 : 0;
    return Math.round(((completed + current * 0.5) / totalSteps) * 100);
  };

  const handleOnSuccessProfileCapture = () => {
    setCustomEvents((e) => [
      ...e,
      {
        step: "fetching_profile",
        status: "step_finished",
      },
    ]);
  };

  const handleOnStartProfileCapture = () => {
    setCustomEvents((e) => [
      ...e,
      {
        step: "fetching_profile",
        status: "step_started",
      },
    ]);
  };

  return (
    <React.Fragment>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogDescription>Refreshing Summoner Data</DialogDescription>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isComplete ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              )}
              {isComplete ? "Refresh Complete" : "Refreshing Summoner Data"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-medium">{getOverallProgress()}%</span>
              </div>
              <Progress value={getOverallProgress()} className="h-2" />
            </div>

            {/* Step List */}
            <div className="space-y-3">
              {steps.map((step) => {
                const status = step.status;
                const Icon = step.icon;

                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      status === "active"
                        ? "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800"
                        : status === "completed"
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : "bg-muted/30 border-border"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {status === "completed" ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : status === "active" ? (
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      ) : (
                        <Icon className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{step.label}</p>
                        <Badge
                          variant={
                            status === "completed"
                              ? "default"
                              : status === "active"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {status === "completed"
                            ? "Done"
                            : status === "active"
                              ? "Running"
                              : "Pending"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{step.description}</p>

                      {/* Match Progress Bar */}
                      {step.key === "fetching_matches" &&
                        status === "active" &&
                        step.matchProgress &&
                        step.matchProgress.total > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Matches</span>
                              <span>
                                {step.matchProgress.fetched} / {step.matchProgress.total}
                              </span>
                            </div>
                            <Progress
                              value={(step.matchProgress.fetched / step.matchProgress.total) * 100}
                              className="h-1"
                            />
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>

            {isComplete && (
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Summoner data refreshed successfully!
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <SummonerProfileCapture
        summoner={summoner}
        matches={matches}
        onSuccessCallback={handleOnSuccessProfileCapture}
        onStartCallback={handleOnStartProfileCapture}
      />
    </React.Fragment>
  );
}
