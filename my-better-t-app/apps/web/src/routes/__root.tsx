import type { QueryClient } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import type { orpc } from "@/utils/orpc";

import { Toaster } from "@/components/ui/sonner";

import Header from "../components/header";
import appCss from "../index.css?url";

// This file is the entire HTML document wrapper. Unlike a normal React app, TanStack Router lets us define <html>, <head>, and <body> elements
// directly inside React.
// 


export interface RouterAppContext {
  orpc: typeof orpc;
  queryClient: QueryClient;
}

// Root route that wraps the entire app. 
export const Route = createRootRouteWithContext<RouterAppContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8", },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "My App", },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  component: RootDocument,
});



// ======== MAIN APP DOCUMENT ========
function RootDocument() {
  return (
    <html lang="en" className="dark">

      {/* HEAD */}
      <head>
        <HeadContent />
      </head>

      {/* BODY */}
      <body>
        <div className="grid h-svh grid-rows-[auto_1fr] overflow-hidden"> {/*CSS grid layout: header + main content  +overflow-hidden to prevent scrolling */}
          <Header />
          <Outlet />
        </div>
        <Toaster richColors />
        <TanStackRouterDevtools position="bottom-left" />
        <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        <Scripts />
      </body>

    </html>
  );
}
