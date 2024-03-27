"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";

import { env } from "~/env";
import { trpc } from "~/app/_trpc/client";

const getServerUrl = () => {
  if (typeof window !== "undefined") return "/api/trpc"; // browser should use relative url
  return `http://localhost:${env.PORT}/api/trpc`; // dev SSR should use localhost
};

interface ProviderProps {
  children: React.ReactNode;
}

export function TRPCProvider({ children }: ProviderProps) {
  const [queryClient] = useState(() => new QueryClient({}));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: getServerUrl(),
        }),
      ],
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
