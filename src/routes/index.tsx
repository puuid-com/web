import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/client/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/client/components/ui/card";
import { $getLandingInfo } from "@/server/functions/$getLandingInfo";
import { Search, Activity, Star, BarChart3, type LucideIcon } from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Search,
  Activity,
  Star,
  BarChart3,
};

export const Route = createFileRoute("/")({
  loader: async () => await $getLandingInfo(),
  component: Landing,
});

function Landing() {
  const { features } = Route.useLoaderData();

  return (
    <div className="container mx-auto flex flex-col items-center gap-16 py-24 text-center">
      <section className="flex max-w-2xl flex-col items-center gap-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-neutral-100">puuid.com</h1>
        <p className="text-lg text-neutral-400">
          Stats, match history and live game info for League of Legends
        </p>
        <Button asChild className="mt-4">
          <Link to="/lol/summoner">Get Started</Link>
        </Button>
      </section>
      <section className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {features.map((f) => {
          const Icon = icons[f.icon];
          return (
            <Card key={f.title} className="bg-neutral-900 border-neutral-800">
              <CardHeader className="items-center text-center gap-3">
                {Icon ? <Icon className="h-6 w-6 text-neutral-200" /> : null}
                <CardTitle className="text-neutral-100">{f.title}</CardTitle>
                <CardDescription className="text-neutral-400">{f.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
