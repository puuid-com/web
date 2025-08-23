import { Button } from "@/client/components/ui/button";
import { Input } from "@/client/components/ui/input";
import { Link } from "@tanstack/react-router";
import { IdCardIcon, IdCardLanyard, Search, Trophy } from "lucide-react";
import React from "react";

type Props = {};

export const Navbar = ({}: Props) => {
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <header className="border-b h-[60px] flex items-center">
      <div className="container mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold flex items-center gap-1">
              {/* <IdCardLanyard size={16} /> */}
              <Link to={"/"}>puuid.com</Link>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search summoner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button>Search</Button>
          </div>
        </div>
      </div>
    </header>
  );
};
