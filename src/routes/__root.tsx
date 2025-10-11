/// <reference types="vite/client" />
import { Suspense, lazy, type ReactNode } from "react";
import { Outlet, HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import appCss from "@/client/styles/app.css?url";
import { Toaster } from "sonner";
import { Footer } from "@/client/components/footer/Footer";
import { Navbar } from "@/client/components/navbar/Navbar";
import { getUserSessionOptions } from "@/client/queries/getUserSession";
import { DDragonService } from "@puuid/core/shared/services/DDragonService";
import { $getChampionsData } from "@/server/functions/$getChampionsData";

const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((mod) => ({ default: mod.ReactQueryDevtools })),
    )
  : null;

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
        title: "puuid.com",
      },
      { name: "theme-color", content: "#000000" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { rel: "icon", href: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
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
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
      <Toaster richColors />
      {ReactQueryDevtools ? (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      ) : null}
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
            "flex flex-col w-full overflow-y-auto relative isolate gap-[var(--default-gap-height)]"
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
