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
        "px-3 py-2 bg-main/30 rounded-t-md flex gap-3 items-center justify-start"
      }
    >
      <Icon className={"w-4 text-main"} />
      <div className={"font-bold"}>{children}</div>
    </div>
  );
};
