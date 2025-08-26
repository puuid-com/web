import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/client/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/client/components/ui/card";
import { Activity, BarChart3, Search } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

type Feature = {
  title: string;
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

const features: Feature[] = [
  {
    title: "Summoner Lookup",
    description: "Search any summoner by name and tag.",
    Icon: Search,
  },
  {
    title: "Live Match Insights",
    description: "Track games in real time and follow your friends.",
    Icon: Activity,
  },
  {
    title: "Champion Analytics",
    description: "Dive deep into champion trends and winrates.",
    Icon: BarChart3,
  },
];

function LandingPage() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-auto">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-3xl animate-pulse" />
      <div className="flex flex-col items-center gap-16 px-4 py-16 text-center">
        <h1 className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-5xl font-extrabold text-transparent md:text-7xl">
          Welcome to PUUID
        </h1>
        <p className="max-w-2xl text-lg md:text-xl">Your magical hub for League of Legends data.</p>
        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {features.map(({ title, description, Icon }) => (
            <Card
              key={title}
              className="bg-neutral-900/60 border-neutral-800 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-purple-500/20"
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Icon className="h-6 w-6 text-purple-400" />
                  {title}
                </CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
        <Link to="/lol/summoner">
          <Button
            size="lg"
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md hover:from-indigo-400 hover:to-pink-400"
          >
            Get Started
          </Button>
        </Link>
      </div>
    </div>
  );
}
