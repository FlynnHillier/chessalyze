import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from '../util/trpc';
import { httpBatchLink } from '@trpc/client';

export function TRPCwrapper({children} : {children:React.ReactNode}) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
        links: [
            httpBatchLink({
                url:`${process.env.REACT_APP_BASE_URL}t`
            })
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