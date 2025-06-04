import type { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import type { ConvexReactClient } from "convex/react";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  convexClient: ConvexReactClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <header className="navbar bg-base-100 shadow-sm border-b border-base-300">
          <div className="container mx-auto flex justify-between w-full">
            <div className="navbar-start">
              <Link
                to="/"
                className="btn btn-ghost normal-case text-xl"
              >
                ZK Email Twitter Verifier
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="footer footer-center p-4 text-base-content">
          <p>© {new Date().getFullYear()} ZK Email Twitter Verifier</p>
        </footer>
      </div>
      {import.meta.env.DEV && <TanStackRouterDevtools />}
    </QueryClientProvider>
  );
}
