/// <reference types="vite/client" />
import type { ReactNode } from "react";
import { Outlet, HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import appCss from "@/client/styles/app.css?url";
import { Toaster } from "sonner";
import { Navbar } from "@/client/components/Navbar";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Footer } from "@/client/components/footer/Footer";

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
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
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
        className={"flex flex-col dark bg-neutral-950 text-neutral-300 overflow-hidden scrollbar"}
      >
        <Navbar />
        <div
          id={"body-content"}
          style={{
            height: `calc(100vh - 60px)`,
          }}
          className={"flex flex-col w-full overflow-y-auto relative isolate"}
        >
          {children}
          <Footer />
        </div>
        <Scripts />
      </body>
    </html>
  );
}
