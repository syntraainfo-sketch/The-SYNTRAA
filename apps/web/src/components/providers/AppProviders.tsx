"use client";

import dynamic from "next/dynamic";
import {
  QueryClient,
  QueryClientProvider,
  defaultShouldDehydrateQuery,
} from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { LenisProvider } from "@/motion/LenisProvider";
import { CursorProvider } from "@/components/cursor/CursorProvider";
import { CustomCursor } from "@/components/cursor/CustomCursor";

/** Framer Motion hooks break some static prerender workers; load only on the client. */
const ScrollProgress = dynamic(
  () =>
    import("@/components/motion/ScrollProgress").then((m) => ({
      default: m.ScrollProgress,
    })),
  { ssr: false },
);

const PageTransition = dynamic(
  () =>
    import("@/components/motion/PageTransition").then((m) => ({
      default: m.PageTransition,
    })),
  { ssr: false },
);

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
      <CursorProvider>
        <CustomCursor />
        <LenisProvider>
          <ScrollProgress />
          <PageTransition>{children}</PageTransition>
        </LenisProvider>
      </CursorProvider>
    </QueryClientProvider>
  );
}
