import { ReactNode, Suspense } from "react";
import { PanelErrorMessageContextProvider } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/error.provider";
import SyncLoader from "~/app/_components/loading/SyncLoader";

/**
 * Layout for /play** panels
 */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <PanelErrorMessageContextProvider>
      {children}
    </PanelErrorMessageContextProvider>
  );
}
