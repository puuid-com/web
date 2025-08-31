import type { LolIndividualPositionType } from "@/server/api-route/riot/match/MatchDTO";
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
  individualPosition: LolIndividualPositionType;
};

const map: Record<LolIndividualPositionType, LucideIcon> = {
  Invalid: SandwichIcon,
  TOP: ArrowUp,
  JUNGLE: TreePine,
  MIDDLE: Zap,
  BOTTOM: ArrowDown,
  UTILITY: Users,
};

export const PositionIcon = ({ individualPosition }: Props) => {
  const Icon = map[individualPosition];

  return <Icon aria-label={individualPosition} />;
};
