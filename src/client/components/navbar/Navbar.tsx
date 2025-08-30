import { UserAccountButton } from "@/client/components/navbar/UserButton";
import { RiotIdForm } from "@/client/components/riot-id-form/RiotIdForm";
import { Link, useNavigate } from "@tanstack/react-router";

type Props = {};

export const Navbar = ({}: Props) => {
  const navigate = useNavigate();

  const handleSummonerSearch = (riotID: string) => {
    navigate({
      to: "/lol/summoner/$riotID",
      params: { riotID },
      search: { queue: "RANKED_SOLO_5x5" },
    }).catch(console.error);
  };

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
              <RiotIdForm onSuccess={handleSummonerSearch} />
            </div>
            <UserAccountButton />
          </div>
        </div>
      </div>
    </header>
  );
};
