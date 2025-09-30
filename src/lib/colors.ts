import type { LeagueRowType } from "@puuid/core/server/db/types";

export const TIER_COLOR_VAR: Record<LeagueRowType["tier"], string> = {
  IRON: "var(--color-tier-iron)",
  BRONZE: "var(--color-tier-bronze)",
  SILVER: "var(--color-tier-silver)",
  GOLD: "var(--color-tier-gold)",
  PLATINUM: "var(--color-tier-platinum)",
  EMERALD: "var(--color-tier-emerald)",
  DIAMOND: "var(--color-tier-diamond)",
  MASTER: "var(--color-tier-master)",
  GRANDMASTER: "var(--color-tier-grandmaster)",
  CHALLENGER: "var(--color-tier-challenger)",
};
