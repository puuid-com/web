import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="container mx-auto flex flex-col items-center h-full w-full justify-center text-center">
      <section className="flex max-w-2xl flex-col items-center gap-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900/50 pointer-events-none select-none">
          puuid.com
        </h1>
      </section>
    </div>
  );
}
