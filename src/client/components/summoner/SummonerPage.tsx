import { SummonerHeader } from "@/client/components/summoner/header/SummonerHeader";
import { SummonerNavigation } from "@/client/components/summoner/navigation/SummonerNavigation";
import { SummonerLiveMatchHeader } from "@/client/components/summoner/live-match-header/SummonerLiveMatchHeader";
import { Outlet } from "@tanstack/react-router";

type Props = {};

export const SummonerPage = ({}: Props) => {
  return (
    <div
      className={"flex flex-col container mx-auto gap-[var(--summoner-gap-height)]"}
      style={
        {
          "--summoner-header-height": "calc(96px + (20px * 2))",
          "--summoner-navigation-height": "calc(45px)",
          "--summoner-gap-height": "calc(20px)",
          "--summoner-outlet-height":
            "calc(var(--body-content-height) - (var(--summoner-header-height) + var(--summoner-navigation-height) + var(--summoner-gap-height) * 2)",
        } as React.CSSProperties
      }
    >
      <SummonerHeader className={"h-[var(--summoner-header-height)]"} />
      <SummonerLiveMatchHeader />
      <SummonerNavigation className={"h-[var(--summoner-navigation-height)]"} />
      <div className={"flex min-h-[var(--summoner-outlet-height)] w-full"}>
        <Outlet />
      </div>
    </div>
  );
};
