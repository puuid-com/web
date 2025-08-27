import { createServerFn } from "@tanstack/react-start";

export const $getLandingInfo = createServerFn({ method: "GET" })
  .type("static")
  .handler(() => {
    return {
      features: [
        {
          title: "Summoner Search",
          description: "Look up any summoner by Riot ID and explore their profile.",
          icon: "Search",
        },
        {
          title: "Live Match Tracking",
          description: "Check active games to see who is on the Rift right now.",
          icon: "Activity",
        },
        {
          title: "Champion Mastery",
          description: "Discover top champions and mastery scores for every player.",
          icon: "Star",
        },
        {
          title: "Match Statistics",
          description: "Dive into detailed match histories and performance analytics.",
          icon: "BarChart3",
        },
      ],
    } as const;
  });

export type $GetLandingInfoType = Awaited<ReturnType<typeof $getLandingInfo>>;
