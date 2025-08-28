import { Button } from "@/client/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { $getAuthUser } from "@/server/functions/$getUserId";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/user/")({
  component: RouteComponent,
  beforeLoad: async () => {
    const user = await $getAuthUser();

    return {
      user,
    };
  },
  loader: (ctx) => {
    return {
      user: ctx.context.user,
    };
  },
});

function RouteComponent() {
  const { user } = Route.useRouteContext();
  const route = Route.useMatch();

  const { data, status } = useQuery({
    queryKey: ["user-accounts"],
    queryFn: async () => {
      const data = await authClient.listAccounts();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.data;
    },
  });

  const handleLinkAccount = async () => {
    await authClient.oauth2.link({
      providerId: "riot-games",
      callbackURL: route.fullPath,
    });
  };

  return (
    <div className={"text-white"}>
      <h1>User Page</h1>
      <p>{JSON.stringify(user, null, 2)}</p>
      <Button onClick={() => void handleLinkAccount()}>Link new accounts</Button>
      {status === "success" ? (
        <div className={"flex flex-col gap-2.5"}>
          {data.map((account) => (
            <div key={account.id}>
              {account.provider} - {account.accountId}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
