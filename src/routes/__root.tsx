/// <reference types="vite/client" />
import type { ReactNode } from "react";
import { Outlet, HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import appCss from "@/client/styles/app.css?url";
import { Toaster } from "sonner";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Footer } from "@/client/components/footer/Footer";
import { Navbar } from "@/client/components/navbar/Navbar";
import { getUserSessionOptions } from "@/client/queries/getUserSession";
import { PrimeReactProvider } from "primereact/api";
import primeReacrCss from "primereact/resources/themes/lara-light-cyan/theme.css?url";
import { DDragonService } from "@/shared/services/DDragon/DDragonService";
import { $getChampionsData } from "@/server/functions/$getChampionsData";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "TanStack Start Starter",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: primeReacrCss },
    ],
  }),
  component: RootComponent,
  beforeLoad: async (ctx) => ctx.context.queryClient.ensureQueryData(getUserSessionOptions()),
  loader: async () => {
    const metadata = await DDragonService.loadMetadata();
    const champions = await $getChampionsData();

    return {
      ...metadata,
      championsData: champions,
    };
  },
  staleTime: Infinity,
  gcTime: Infinity,

  shouldReload: true,
});

function RootComponent() {
  return (
    <RootDocument>
      <PrimeReactProvider>
        <Outlet />
      </PrimeReactProvider>
      <Toaster richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </RootDocument>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html>
      <head>
        <HeadContent />
      </head>
      <body
        className={"dark flex flex-col overflow-hidden scrollbar bg-background"}
        style={
          {
            "--footer-height": "calc(60px)",
            "--navbar-height": "calc(60px)",
            "--default-gap-height": "calc(20px)",
            "--body-height": "calc(100vh - var(--navbar-height))",
            "--body-content-height":
              "calc(var(--body-height) - var(--footer-height) - var(--default-gap-height))",
          } as React.CSSProperties
        }
      >
        <Navbar className={"h-[var(--navbar-height)]"} />
        <div
          id={"body-content"}
          style={
            {
              height: `var(--body-height)`,
            } as React.CSSProperties
          }
          className={
            "flex flex-col w-full overflow-y-auto relative isolate gap-[var(-default-gap-height)]"
          }
        >
          {children}
          <Footer className={"h-[var(--footer-height)]"} />
        </div>
        <Scripts />
      </body>
    </html>
  );
}
