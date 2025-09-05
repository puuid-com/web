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
        <div className="flex items-center">
          <div className="flex items-center gap-2 justify-between mr-10">
            <h1 className="font-semibold ">
              <Link to={"/"}>puuid.com</Link>
            </h1>
          </div>
          <div className={"flex items-center justify-between text-sm"}>
            <Link to={"/lol/summoner"}>Summoners</Link>
          </div>
          <div className="flex items-center gap-3 ml-auto">
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
