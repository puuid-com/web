import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/client/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/client/components/ui/card";
import { RiotIdForm } from "@/client/components/riot-id-form/RiotIdForm";

export const Route = createFileRoute("/")({
  component: Home,
  headers: () => ({
    "Cache-Control": "public, max-age=3600",
  }),
});

function Home() {
  const navigate = useNavigate();

  const handleSummonerSearch = (riotID: string) => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    navigate({
      to: "/lol/summoner/$riotID",
      params: { riotID },
      search: { queue: "RANKED_SOLO_5x5" },
    });
  };

  const features = [
    {
      title: "Summoner Stats",
      description: "View ranked stats for any player.",
    },
    {
      title: "Match History",
      description: "Analyze recent matches in detail.",
    },
    {
      title: "Live Games",
      description: "Check featured games in real time.",
    },
  ];

  return (
    <section className="container mx-auto flex flex-col items-center gap-16 py-24 text-center">
      <div className="flex flex-col items-center gap-6 max-w-3xl">
        <h1 className="text-5xl font-bold tracking-tight text-neutral-100">
          Track League of Legends like a pro
        </h1>
        <p className="text-lg text-neutral-400">
          Search summoners, inspect match histories and stay ahead of the competition.
        </p>
        <div className="w-full max-w-md">
          <RiotIdForm onSuccess={handleSummonerSearch} />
        </div>
      </div>
      <div className="grid gap-8 w-full max-w-5xl md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-neutral-100">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-neutral-400">{feature.description}</CardContent>
          </Card>
        ))}
      </div>
      <Button asChild size="lg" className="bg-neutral-800 text-neutral-100 hover:bg-neutral-700">
        <Link to="/lol/summoner">Get Started</Link>
      </Button>
    </section>
  );
}
