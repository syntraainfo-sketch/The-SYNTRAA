"use client";

import {
  QueryClient,
  QueryClientProvider,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { LenisProvider } from "@/motion/LenisProvider";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import { PageTransition } from "@/components/motion/PageTransition";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          dehydrate: {
            shouldDehydrateQuery: (q) =>
              defaultShouldDehydrateQuery(q) || Boolean(q.promise),
          },
        },
      })
  );

  return (
    <QueryClientProvider client={client}>
      <LenisProvider>
        <CursorGlow />
        <ScrollProgress />
        <PageTransition>{children}</PageTransition>
      </LenisProvider>
    </QueryClientProvider>
  );
}
