import { ReactNode } from "react";
import { TRPCProvider } from "~/app/_components/providers/client/trpc.provider";
import { WSProvider } from "../_components/providers/client/ws.provider";
import { GlobalErrorProvider } from "../_components/providers/client/globalError.provider";
import NotificationProvider from "../_components/providers/client/notifications.provider";

/**
 * This layout should encapsulate any dynamic (non-static) pages.
 * This allows us to cache static pages by only applying session cookies to dynamic pages.
 */
export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <TRPCProvider>
      <WSProvider>
        <NotificationProvider>{children}</NotificationProvider>
      </WSProvider>
    </TRPCProvider>
  );
}
