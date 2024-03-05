import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { authOptions } from "~/server/auth";
import SessionProvider from "~/app/_components/providers/session.provider"
import { TRPCProvider } from "~/app/_components/providers/trpc.provider";

/**
 * This layout should encapsulate any dynamic (non-static) pages.
 * This allows us to cache static pages by only applying session cookies to dynamic pages.
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <TRPCProvider>
      <SessionProvider session={session}>
        <div>{children}</div>
      </SessionProvider>
    </TRPCProvider>
  )
}