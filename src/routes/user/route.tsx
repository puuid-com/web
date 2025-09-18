import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import {
  SidebarProvider,
  Sidebar as AppSidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/client/components/ui/sidebar";
import { CogIcon, UsersIcon } from "lucide-react";

export const Route = createFileRoute("/user")({
  beforeLoad: (ctx) => {
    const context = ctx.context;

    if (!context.user) {
      throw redirect({ to: "/" });
    }

    return {
      user: context.user,
      userPage: context.userPage,
      summoners: context.summoners,
      mainSummoner: context.mainSummoner,
      otherSummoners: context.otherSummoners,
    };
  },
  component: UserLayout,
});

function UserLayout() {
  return (
    <SidebarProvider>
      <div
        className="p-5 relative flex container mx-auto"
        style={
          {
            "--sidebar-width": "240px",
          } as React.CSSProperties
        }
      >
        <AppSidebar
          className="rounded-md border fixed"
          style={{
            width: `var(--sidebar-width)`,
            height: `var(--body-content-height)`,
          }}
        >
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/user/accounts"
                    preload="intent"
                    activeProps={{
                      className:
                        "data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground",
                    }}
                  >
                    <UsersIcon className="size-4" />
                    <span>Linked Accounts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link
                    to="/user/settings"
                    preload="intent"
                    activeProps={{
                      className:
                        "data-[status=active]:bg-sidebar-accent data-[status=active]:text-sidebar-accent-foreground",
                    }}
                  >
                    <CogIcon className="size-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </AppSidebar>

        <main
          className="overflow-y-auto flex-1"
          style={{
            marginLeft: `calc(var(--sidebar-width) + 20px)`,
            height: `var(--body-content-height)`,
          }}
        >
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}
