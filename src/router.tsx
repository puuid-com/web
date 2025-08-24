import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";
import { routeTree } from "@/routeTree.gen";
import { QueryClient } from "@tanstack/react-query";
import LoadingScreen from "@/client/components/Loading";

export function createRouter() {
  const queryClient = new QueryClient();

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    context: { queryClient },
    defaultNotFoundComponent: () => {
      return (
        <div className={"w-screen h-screen flex justify-center items-center"}>
          <h1 className={"text-neutral-800 text-3xl font-bold"}>Not Found</h1>
        </div>
      );
    },
    defaultPendingComponent: LoadingScreen,
    defaultComponent: LoadingScreen,
  });

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof createRouter>;
  }
}
