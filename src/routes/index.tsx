import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, Search, Gamepad2, BarChart3, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const features: { icon: LucideIcon; title: string; description: string; to: string }[] = [
    {
      icon: Search,
      title: "Summoner Lookup",
      description: "Find player stats by Riot ID.",
      to: "/lol/summoner",
    },
    {
      icon: Gamepad2,
      title: "Featured Games",
      description: "Watch live games across regions.",
      to: "/lol/featured-games/na1",
    },
    {
      icon: BarChart3,
      title: "Match Insights",
      description: "Dive into detailed match statistics.",
      to: "/lol/summoner",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 overflow-auto">
      <section className="text-center space-y-4 mb-16">
        <Sparkles className="mx-auto w-12 h-12 text-fuchsia-400 animate-pulse" />
        <h1 className="text-5xl font-black bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Welcome to puuid.com
        </h1>
        <p className="text-neutral-400 max-w-xl mx-auto">
          Explore League of Legends data with a touch of magic.
        </p>
      </section>
      <section className="grid gap-8 w-full max-w-5xl sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, description, to }) => (
          <Link
            key={title}
            to={to}
            className="group p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-fuchsia-500 transition-colors backdrop-blur"
          >
            <Icon className="w-10 h-10 text-fuchsia-400 mb-4 group-hover:animate-bounce" />
            <h3 className="text-xl font-semibold text-neutral-100">{title}</h3>
            <p className="mt-2 text-sm text-neutral-400">{description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
