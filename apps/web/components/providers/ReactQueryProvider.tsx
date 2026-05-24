//apps/web/components/providers/ReactQueryProvider.tsx
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

type ReactQueryProviderProps = {
  children: ReactNode;
};

export default function ReactQueryProvider({
  children,
}: ReactQueryProviderProps) {
  // Why this provider exists (important React Query concept):
  // React Query needs a QueryClient at the top of the client tree.
  // The QueryClient is the in-memory "cache manager" for all queries.
  // If we do not provide it once in layout, each page/component would need manual setup and cache sharing would break.

  // Why useState(() => new QueryClient(...)) is used here:
  // 1) It guarantees one QueryClient instance per browser tab/session.
  // 2) Without useState lazy initializer, a new client could be created on each render,
  //    which would reset cache and cause unnecessary refetches.
  // 3) This is the recommended pattern in Next.js client provider components.

  // Meaning of defaultOptions in simple terms:
  // - staleTime: how long data is considered fresh before React Query may refetch.
  // - gcTime: how long unused query data stays in cache before cleanup.
  // - refetchOnWindowFocus: whether it auto-refreshes when user returns to tab.
  // - retry: how many times to retry failed requests automatically.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
