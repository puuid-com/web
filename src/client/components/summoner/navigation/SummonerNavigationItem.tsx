import * as React from "react";
import { createLink, type LinkComponent } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/client/lib/utils";

interface BasicLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  iconNode: LucideIcon;
}

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement, BasicLinkProps>(
  ({ children, iconNode: Icon, ...props }, ref) => {
    return (
      <a
        ref={ref}
        {...props}
        className={cn(
          "flex px-5 py-2 gap-1.5 hover:text-neutral-50 transition-colors duration-150",
          "group relative",
        )}
      >
        <Icon
          className={"w-3 group-data-[status=active]:text-main transition-colors duration-300"}
        />
        {children}
        <div
          className={
            "bg-main transition-opacity duration-300 h-1 w-1/2 rounded-b-full group-data-[status=active]:opacity-100 opacity-0 absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2"
          }
        />
      </a>
    );
  },
);

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const SummonerNavigationItem: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return <CreatedLinkComponent preload={"intent"} {...props} />;
};
