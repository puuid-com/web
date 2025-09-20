import { createFileRoute, Link, Outlet, useRouteContext } from "@tanstack/react-router";

export const Route = createFileRoute("/lol/feed")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = useRouteContext({ from: "__root__" });

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
        {user ? (
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
        ) : null}
      </nav>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
