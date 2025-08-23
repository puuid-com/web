import type { IndividualPositionType } from "@/server/api-route/riot/match/MatchDTO";
import {
  ArrowDown,
  ArrowUp,
  TreePine,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Props = {
  individualPosition: IndividualPositionType;
};

const map = {
  TOP: ArrowUp,
  JUNGLE: TreePine,
  MIDDLE: Zap,
  BOTTOM: ArrowDown,
  UTILITY: Users,
} satisfies Record<IndividualPositionType, LucideIcon>;

export const PositionIcon = ({ individualPosition }: Props) => {
  const Icon = map[individualPosition];

  return <Icon aria-label={individualPosition} />;
};
