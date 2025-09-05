import { SmartChildrens } from "@/client/components/SmartChildrens";
import React from "react";

type Props = {};

export function SummonerSidebarStats({ children }: React.PropsWithChildren<Props>) {
  return (
    <div className={"flex flex-col bg-background border rounded-md justify-center divide-y-1"}>
      <SmartChildrens>{children}</SmartChildrens>
    </div>
  );
}
