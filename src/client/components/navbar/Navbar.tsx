import * as React from "react";
import { UserAccountButton } from "@/client/components/navbar/UserButton";
import { RiotIdForm } from "@/client/components/riot-id-form/RiotIdForm";
import { cn } from "@/client/lib/utils";
import { Link, useNavigate } from "@tanstack/react-router";

type Props = {
  className?: React.ComponentProps<"div">["className"];
};

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
          <Link to={"/"} className="font-medium tracking-tight">
            puuid.com
          </Link>
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <RiotIdForm onSuccess={handleSummonerSearch} />
            </div>
            <UserAccountButton />
          </div>
        </div>
      </div>
    </header>
  );
};
