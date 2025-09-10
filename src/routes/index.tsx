import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { RiotIdForm } from "@/client/components/riot-id-form/RiotIdForm";

export const Route = createFileRoute("/")({ component: Landing });

function Landing() {
  const navigate = useNavigate();

  const handleSummonerSearch = (riotID: string) => {
    navigate({
      to: "/lol/summoner/$riotID",
      params: { riotID },
      search: { q: "solo" },
    }).catch(console.error);
  };

  return (
    <div className="w-full">
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute left-1/2 top-[-10%] h-[70vh] w-[140vw] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
          <div className="absolute left-1/2 bottom-[-20%] h-[60vh] w-[140vw] -translate-x-1/2 rounded-[999px] bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.07),transparent_60%)]" />
        </div>

        <div
          className="container mx-auto px-4 py-16 md:py-24"
          style={{ minHeight: "var(--body-content-height)" }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-balance bg-gradient-to-b from-foreground to-neutral-300 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent md:text-6xl">
              Track League profiles by Riot ID
            </h1>
            <p className="mt-3 text-neutral-300 md:text-lg">
              Look up any player. Get ranked stats and match history instantly.
            </p>

            <div className="mt-8 mx-auto w-full max-w-xl">
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3 backdrop-blur flex items-center justify-center w-fit mx-auto">
                <RiotIdForm onSuccess={handleSummonerSearch} />
              </div>
            </div>

            {/* Quick examples */}
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs">
              <span className="text-neutral-500">Try:</span>
              <button
                onClick={() => {
                  handleSummonerSearch("Hide on bush#KR1");
                }}
                className="rounded-md border border-neutral-800 px-2.5 py-1 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100"
              >
                Hide on bush#KR1
              </button>
              <button
                onClick={() => {
                  handleSummonerSearch("Fiat 126p#gowno");
                }}
                className="rounded-md border border-neutral-800 px-2.5 py-1 text-neutral-300 hover:border-neutral-700 hover:text-neutral-100"
              >
                Fiat 126p#gowno
              </button>
            </div>

            {/* Small secondary link */}
            <div className="mt-6">
              <Link
                to="/lol/live"
                className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
              >
                View a random player
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
