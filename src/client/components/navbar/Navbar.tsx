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
      search: { queue: "RANKED_SOLO_5x5" },
    }).catch(console.error);
  };

  return (
    <header className={cn("border-b flex items-center", className)}>
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
              <RiotIdForm onSuccess={handleSummonerSearch} />
            </div>
            <UserAccountButton />
          </div>
        </div>
      </div>
    </header>
  );
};
