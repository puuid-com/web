import type { IndividualPositionType } from "@/server/api-route/riot/match/MatchDTO";
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
  individualPosition: IndividualPositionType;
};

const map: Record<IndividualPositionType, LucideIcon> = {
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
