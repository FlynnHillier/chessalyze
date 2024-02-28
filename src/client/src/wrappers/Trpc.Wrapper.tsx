import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '../util/trpc';
import { createWSClient, httpBatchLink, splitLink, wsLink } from '@trpc/client';

export function TRPCwrapper({children} : {children:React.ReactNode}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
        links: [
          splitLink({
            condition: op => {
              return op.type === "subscription"
            },
            true:wsLink({
              client:createWSClient({
                url:`ws://${process.env.REACT_APP_DOMAIN}/t`,
                onOpen: () => {

                }
              })
            }),
            false:httpBatchLink({
              url:`http://${process.env.REACT_APP_DOMAIN}/t`,
              fetch(url, options) {
                return fetch(url, {
                  ...options,
                  credentials: 'include',
                })
              }
            })
          }
          )
        ]
    }),
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </trpc.Provider>
  );
}