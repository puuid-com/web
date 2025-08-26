import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Home,
  beforeLoad: () => {
    throw redirect({
      to: "/lol/summoner",
    });
  },
});

function Home() {
  return (
    <div className={"w-full h-full flex items-center justify-center flex-1"}>
      <Link to={"/lol/summoner"}>
        <h1 className={"text-neutral-900 text-[200px] font-extrabold"}>(League of Legends)</h1>
      </Link>
    </div>
  );
}
