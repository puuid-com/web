import type { LucideIcon } from "lucide-react";

type Props = {
  iconName: LucideIcon;
};

export const SummonerSidebarStatsHeader = ({
  iconName: Icon,
  children,
}: React.PropsWithChildren<Props>) => {
  return (
    <div
      className={
        "px-3 py-2 bg-main rounded-t-md flex gap-3 items-center justify-start"
      }
    >
      <Icon className={"w-4 text-main-foreground"} />
      <div className={"font-bold text-main-foreground"}>{children}</div>
    </div>
  );
};
