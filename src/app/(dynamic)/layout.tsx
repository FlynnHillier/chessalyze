import { ReactNode } from "react";
import { TRPCProvider } from "~/app/_components/providers/trpc.provider";

/**
 * This layout should encapsulate any dynamic (non-static) pages.
 * This allows us to cache static pages by only applying session cookies to dynamic pages.
 */
export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <TRPCProvider>
      <div>{children}</div>
    </TRPCProvider>
  );
}
