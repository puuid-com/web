import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/client/components/ui/button";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className={""}>
      <Link to={"/lol/summoner"}>
        <Button>See Summoner Page</Button>
      </Link>
    </div>
  );
}
