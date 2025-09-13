import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/feed")({
  component: RouteComponent,
  beforeLoad: (ctx) => {
    const context = ctx.context;

    if (!context.user) {
      throw redirect({ to: "/" });
    }
    return {
      user: context.user,
      summoners: context.summoners,
      mainSummoner: context.mainSummoner,
      otherSummoners: context.otherSummoners,
    };
  },
});

function RouteComponent() {
  return (
    <div className={"flex flex-col gap-4"}>
      <nav
        className={
          "flex gap-2 items-center justify-center sticky top-0 z-10 bg-background/80 backdrop-blur border-b py-2"
        }
      >
        <Link
          to={"/lol/feed/for-you"}
          preload="intent"
          activeProps={{
            className:
              "data-[status=active]:bg-main/15 data-[status=active]:text-main data-[status=active]:border-main",
          }}
          className={
            "px-3 py-1.5 rounded-md border text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
          }
        >
          For you
        </Link>
        <Link
          to={"/lol/feed/following"}
          preload="intent"
          activeProps={{
            className:
              "data-[status=active]:bg-main/15 data-[status=active]:text-main data-[status=active]:border-main",
          }}
          className={
            "px-3 py-1.5 rounded-md border text-sm text-muted-foreground hover:text-foreground hover:bg-muted"
          }
        >
          Following
        </Link>
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
