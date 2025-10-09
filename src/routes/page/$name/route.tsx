import { $getUserPage } from "@/server/functions/$getUserPage";
import { createFileRoute, Outlet, redirect, useRouteContext } from "@tanstack/react-router";
import { UserPageHeader } from "@/client/components/user-page/UserPageHeader";
import { UserPageSummoners } from "@/client/components/user-page/aside/UserPageSummoners";
import { UserPageAdminDialog } from "@/client/components/user-page/admin/UserPageAdminDialog";

export const Route = createFileRoute("/page/$name")({
  component: RouteComponent,
  loader: async (ctx) => {
    const user = ctx.context.user;
    const { name } = ctx.params;
    const { page } = await $getUserPage({ data: { name } });

    if (!page) {
      throw redirect({ to: "/" });
    }

    return {
      page,
      isOwner: user?.id === page.userId,
    };
  },
});

function RouteComponent() {
  const { role } = useRouteContext({ from: "__root__" });
  const isAdmin = role === "ADMIN";

  return (
    <div className="container mx-auto" style={{ minHeight: "var(--body-content-height)" }}>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-4">
          <UserPageHeader />
          {isAdmin ? (
            <div className="flex justify-end">
              <UserPageAdminDialog />
            </div>
          ) : null}
        </header>
        <main className={"flex gap-5 flex-row"}>
          <aside className={"flex bg-red-500/20"}>
            <UserPageSummoners />
          </aside>
          <div className={"flex bg-blue-500/20 flex-1"}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
