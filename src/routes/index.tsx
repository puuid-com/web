import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, Gamepad2, Search } from "lucide-react";

const features = [
  {
    title: "Summoner Search",
    description: "Quickly find any summoner by Riot ID.",
    icon: Search,
  },
  {
    title: "Live Featured Games",
    description: "See what's happening on the Rift right now.",
    icon: Gamepad2,
  },
  {
    title: "Detailed Stats",
    description: "Dive into ranked performance and champion mastery.",
    icon: BarChart3,
  },
];

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="relative flex w-full flex-col items-center justify-center gap-12 overflow-y-auto p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.15),transparent_70%)]" />
      <section className="text-center">
        <h1 className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-5xl font-extrabold text-transparent sm:text-7xl">
          puuid.com
        </h1>
        <p className="mt-4 text-lg text-neutral-400">
          Explore League of Legends stats with a touch of magic.
        </p>
        <Link
          to="/lol/summoner"
          className="mt-8 inline-block rounded-md bg-purple-600 px-8 py-3 text-white transition-colors hover:bg-purple-700"
        >
          Get Started
        </Link>
      </section>
      <section className="grid w-full max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ title, description, icon: Icon }) => (
          <div
            key={title}
            className="flex flex-col items-center rounded-lg border border-neutral-800 bg-neutral-900/50 p-6 text-center transition-transform hover:-translate-y-1 hover:border-purple-600/40"
          >
            <Icon className="mb-4 h-12 w-12 text-purple-400" />
            <h3 className="mb-2 text-xl font-semibold text-neutral-200">{title}</h3>
            <p className="text-neutral-400">{description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
