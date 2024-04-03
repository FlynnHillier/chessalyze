import { ReactNode } from "react";
import SessionProvider from "~/app/_components/providers/session.provider";
import { TRPCProvider } from "~/app/_components/providers/trpc.provider";
import { getServerSession } from "~/lib/lucia/util.lucia";

/**
 * This layout should encapsulate any dynamic (non-static) pages.
 * This allows us to cache static pages by only applying session cookies to dynamic pages.
 */
export default async function Layout({ children }: { children: ReactNode }) {
  const { session, user } = await getServerSession();

  return (
    <SessionProvider session={session} user={user}>
      <TRPCProvider>{children}</TRPCProvider>
    </SessionProvider>
  );
}
