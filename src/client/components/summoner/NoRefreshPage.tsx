import { motion } from "framer-motion";
import { Database, RefreshCw } from "lucide-react";
import { Button } from "@/client/components/ui/button";
import { Link } from "@tanstack/react-router";
import type { SummonerType } from "@/server/db/schema";
import type { LolQueueType } from "@/server/api-route/riot/league/LeagueDTO";

type Props = {
  summoner: SummonerType;
  queue: LolQueueType;
};

export function SummonerNeverFetchedNotice({ summoner, queue }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`overflow-hidden w-1/2 relative mx-auto rounded-2xl border border-dashed border-white/10 bg-gradient-to-b from-white/2 to-transparent p-8 shadow-sm`}
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-24 -z-10 blur-2xl"
        style={{
          background:
            "conic-gradient(from 90deg at 50% 50%, rgba(168,85,247,.18), rgba(99,102,241,.18), rgba(251,191,36,.18), rgba(168,85,247,.18))",
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      />

      <div className="relative mx-auto grid max-w-md place-items-center text-center">
        <div className="relative">
          <motion.span
            className="absolute -inset-6 rounded-full bg-gradient-to-br from-fuchsia-500/25 via-indigo-500/25 to-amber-500/25 blur-lg"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          />

          <div className="relative grid size-16 place-items-center rounded-full border border-white/10 bg-black/40 backdrop-blur">
            <Database className="size-7 opacity-80" aria-hidden />
          </div>

          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full ring-2 ring-white/10"
            animate={{ scale: [1, 1.25], opacity: [0.9, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
          />
          <motion.span
            aria-hidden
            className="absolute inset-0 rounded-full ring-2 ring-white/10"
            animate={{ scale: [1, 1.55], opacity: [0.7, 0] }}
            transition={{
              repeat: Infinity,
              duration: 3.2,
              ease: "easeOut",
              delay: 0.25,
            }}
          />
        </div>

        <div className={"flex flex-col gap-1.5"}>
          <h3 className="mt-5 text-xl font-semibold tracking-tight">
            No data yet
          </h3>
          <Button asChild className={"animate-pulse"} size={"sm"}>
            <Link
              to={"/lol/summoner/$riotID/refresh"}
              params={{ riotID: summoner.riotId }}
              search={{ queue: queue }}
            >
              <RefreshCw />
              Fetch data
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
