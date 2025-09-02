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
        "px-3 py-2 rounded-t-md flex gap-3 items-center justify-start bg-main/10 text-main ring-1 ring-main/30 shadow-[inset_0_1px_0_rgb(255_255_255_/_0.04)]"
      }
    >
      <Icon className={"w-4"} />
      <div className={"font-bold"}>{children}</div>
    </div>
  );
};
