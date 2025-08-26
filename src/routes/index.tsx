import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Gamepad2, Users } from "lucide-react";
import type { ElementType } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

type Feature = {
  icon: ElementType;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Users,
    title: "Summoner Search",
    description: "Look up summoners by Riot ID and view their profiles.",
  },
  {
    icon: Gamepad2,
    title: "Featured Games",
    description: "See live games happening across regions in real time.",
  },
  {
    icon: BarChart3,
    title: "Match Analytics",
    description: "Inspect match history and performance metrics.",
  },
];

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full overflow-auto bg-gradient-to-b from-indigo-950 via-purple-900 to-neutral-950 px-4 py-16 text-center">
      <h1 className="mb-6 bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-5xl font-extrabold text-transparent sm:text-7xl animate-pulse">
        puuid.com
      </h1>
      <p className="mb-12 max-w-2xl text-lg text-neutral-300">
        Track League of Legends statistics with a dash of magic.
      </p>
      <div className="mb-12 grid w-full max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-colors hover:bg-white/10"
          >
            <Icon className="mx-auto mb-4 h-10 w-10 text-fuchsia-400 animate-bounce" />
            <h3 className="mb-2 text-xl font-semibold">{title}</h3>
            <p className="text-sm text-neutral-300">{description}</p>
          </div>
        ))}
      </div>
      <Link
        to="/lol/summoner"
        className="rounded-lg bg-fuchsia-600 px-6 py-3 font-medium text-white shadow transition-colors hover:bg-fuchsia-500"
      >
        Get started
      </Link>
    </div>
  );
}
