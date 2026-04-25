"use client";

import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Tekil QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 30, // 30 saniye
    },
  },
});

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
