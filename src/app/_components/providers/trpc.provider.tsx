"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createWSClient, httpBatchLink, splitLink, wsLink } from "@trpc/client";
import superjson from "superjson";

import { env } from "~/env";
import { trpc } from "~/app/_trpc/client";

const getServerUrl = () => {
  if (typeof window !== "undefined") return "/api/trpc"; // browser should use relative url
  return `http://localhost:${env.PORT}/api/trpc`; // dev SSR should use localhost
};

const getWSSUrl = () => {
  //TODO: when in production change this from localhost to relative.
  return `ws://localhost:${env.WSS_PORT}/api/trpc`;
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
        splitLink({
          condition(op) {
            return op.type === "subscription";
          },
          true: wsLink({
            client: createWSClient({
              url: getWSSUrl(),
            }),
          }),
          false: httpBatchLink({
            url: getServerUrl(),
          }),
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
