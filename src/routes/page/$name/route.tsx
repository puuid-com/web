import { $getUserPage } from "@/server/functions/$getUserPage";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { UserPageHeader } from "@/client/components/user-page/UserPageHeader";
import { UserPageSummoners } from "@/client/components/user-page/aside/UserPageSummoners";

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
  return (
    <div className="container mx-auto" style={{ minHeight: "var(--body-content-height)" }}>
      <div className="flex flex-col gap-5">
        <header>
          <UserPageHeader />
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
