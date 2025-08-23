import * as React from "react";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import { Button } from "@/client/components/ui/button";

interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {}

const _LinkComponent = React.forwardRef<HTMLAnchorElement, Props>(
  ({ children, ...props }, ref) => {
    return (
      <Button variant="secondary" size="sm" asChild={true}>
        <a ref={ref} {...props}>
          {children}
        </a>
      </Button>
    );
  }
);

const CreatedLinkComponent = createLink(_LinkComponent);

const blankAnchorProps: React.AnchorHTMLAttributes<HTMLAnchorElement> = {};

export const SummonerNavigationItem: LinkComponent<typeof _LinkComponent> = ({
  ...props
}) => {
  return <CreatedLinkComponent preload={"intent"} {...props} />;
};
