import { $getPuuidFromID } from "@/server/functions/$getPuuidFromID";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$id")({
  component: RouteComponent,
  beforeLoad: async (ctx) => {
    const id = ctx.params.id.replace("-", "#");

    if (id === ".well#known") return;

    const data = await $getPuuidFromID({
      data: {
        id,
      },
    });

    if (data === null) {
      console.error(`\`${id}\` is neither a puuid nor a riotID.`);

      throw redirect({
        to: "/",
      });
    } else if (data === id) {
      // id was already an puuid, we are good
    } else {
      throw redirect({
        to: "/$id",
        params: {
          id: data,
        },
        replace: true,
      });
    }
  },
});

function RouteComponent() {
  const { id } = Route.useParams();
  return (
    <div className={"bg-purple-500 flex flex-1 justify-center items-center"}>
      <div>
        <h1 className={"text-3xl break-all"}>
          {"<"}
          {id}
          {">"}
        </h1>
      </div>
    </div>
  );
}
