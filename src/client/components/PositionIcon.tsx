import type { LolPositionType } from "@/server/api-route/riot/match/MatchDTO";
import {
  ArrowDown,
  ArrowUp,
  SandwichIcon,
  TreePine,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Props = {
  position: LolPositionType;
};

const map: Record<LolPositionType, LucideIcon> = {
  "": SandwichIcon,
  TOP: ArrowUp,
  JUNGLE: TreePine,
  MIDDLE: Zap,
  BOTTOM: ArrowDown,
  UTILITY: Users,
};

export const PositionIcon = ({ position }: Props) => {
  const Icon = map[position];

  return <Icon aria-label={position} />;
};
