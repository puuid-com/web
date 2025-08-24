import { Button } from "@/client/components/ui/button";
import React from "react";

type Props = {
  firstCount?: number;
  moreLabel?: string;
  lessLabel?: string;
};

type ShowButtonProps = {
  toggleShowAll: () => void;
  showAll: boolean;
};

const ShowButton = ({ toggleShowAll, showAll }: ShowButtonProps) => {
  return (
    <Button onClick={toggleShowAll} className={"m-1.5 w-fit mx-auto"} size={"xs"}>
      {showAll ? "Show Less" : "Show all"}
    </Button>
  );
};

export const SmartChildrens = ({ children, firstCount = 5 }: React.PropsWithChildren<Props>) => {
  const [showAll, setShowAll] = React.useState(false);
  const items = React.Children.toArray(children);
  const visible = showAll ? items : items.slice(0, firstCount);

  if (items.length <= firstCount) return <>{items}</>;

  return (
    <React.Fragment>
      {visible}
      <ShowButton
        showAll={showAll}
        toggleShowAll={() => {
          setShowAll((s) => !s);
        }}
      />
    </React.Fragment>
  );
};
