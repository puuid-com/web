import type { LolPositionType } from "@puuid/core/shared/types/index";
import {
  SandwichIcon,
  Mountain,
  Leaf,
  Compass,
  Target,
  Shield,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

const map: Record<LolPositionType, LucideIcon> = {
  "": SandwichIcon,
  // Tweaked icon set for clearer semantics
  TOP: Mountain,
  JUNGLE: Leaf,
  MIDDLE: Compass,
  BOTTOM: Target,
  UTILITY: Shield,
};

type Props = { position: LolPositionType } & LucideProps;

export const PositionIcon = ({ position, ...iconProps }: Props) => {
  const Icon = map[position];
  return <Icon aria-label={position} {...iconProps} />;
};
