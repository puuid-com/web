import * as React from "react";
import { cn } from "@/client/lib/utils";
import { Slot } from "@radix-ui/react-slot";

type SidebarCtx = {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toggle: () => void;
};

const SidebarContext = React.createContext<SidebarCtx | null>(null);

function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error("Sidebar components must be used within <SidebarProvider>");
  return ctx;
}

function SidebarProvider({
  children,
  defaultCollapsed = false,
}: React.PropsWithChildren<{ defaultCollapsed?: boolean }>) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed);
  const toggle = React.useCallback(() => {
    setCollapsed((c) => !c);
  }, []);
  const value = React.useMemo(() => ({ collapsed, setCollapsed, toggle }), [collapsed, toggle]);
  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

function Sidebar({ className, children, ...props }: React.ComponentProps<"aside">) {
  const { collapsed } = useSidebar();
  return (
    <aside
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "bg-sidebar text-sidebar-foreground border-border/60 w-56 shrink-0 border-r transition-[width] duration-200",
        "data-[collapsed=true]:w-16",
        className,
      )}
      {...props}
    >
      {children}
    </aside>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-3 py-2", className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-auto px-3 py-2", className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-2 py-2", className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul className={cn("flex flex-col gap-1", className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("", className)} {...props} />;
}

function SidebarMenuButton({
  className,
  asChild,
  ...props
}: React.ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="sidebar-menu-button"
      className={cn(
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80",
        "data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground",
        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function SidebarTrigger({ className, children, ...props }: React.ComponentProps<"button">) {
  const { toggle } = useSidebar();
  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "text-sidebar-foreground/70 hover:text-sidebar-foreground inline-flex items-center gap-2 rounded-md px-2 py-1 text-sm",
        className,
      )}
      {...props}
    >
      {children ?? <span>Toggle</span>}
    </button>
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-2 py-2", className)} {...props} />;
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-2 py-1 text-[10px] uppercase tracking-wide text-sidebar-foreground/60",
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("mt-1 flex flex-col gap-1", className)} {...props} />;
}

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
};
