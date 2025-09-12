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
    <div className={"flex flex-col gap-5"}>
      <div className={"gap-10 items-center justify-center"}>
        <Link to={"/lol/feed/for-you"}>For you</Link>
        <Link to={"/lol/feed/following"}>Following</Link>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  );
}
