import * as React from "react";
import { RiotIdForm } from "@/client/components/riot-id-form/RiotIdForm";
import { cn } from "@/client/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";
import { NewspaperIcon } from "lucide-react";

type Props = {
  className?: React.ComponentProps<"div">["className"];
};

const UserAccountButton = React.lazy(() =>
  import("@/client/components/navbar/UserButton").then((mod) => ({ default: mod.UserAccountButton })),
);

const UserButtonFallback = () => (
  <div className="w-8 h-8 rounded-md bg-muted animate-pulse" aria-hidden />
);

export const Navbar = ({ className }: Props) => {
  const navigate = useNavigate();

  const handleSummonerSearch = (riotID: string) => {
    navigate({
      to: "/lol/summoner/$riotID",
      params: { riotID },
      search: { q: "solo" },
    }).catch(console.error);
  };

  return (
    <header className={cn("border-b", className)}>
      <div className="container mx-auto h-full px-4">
        <div className="flex h-full items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to={"/"} className="font-medium tracking-tight">
              puuid.com
            </Link>
            <Link
              to="/lol/feed/for-you"
              preload="intent"
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted"
              activeProps={{ className: "text-main bg-main/10" }}
              aria-label="Feed"
            >
              <NewspaperIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Feed</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <RiotIdForm onSuccess={handleSummonerSearch} />
            </div>
            <React.Suspense fallback={<UserButtonFallback />}>
              <UserAccountButton />
            </React.Suspense>
          </div>
        </div>
      </div>
    </header>
  );
};
