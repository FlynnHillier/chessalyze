import type { Metadata } from "next";
import "./globals.css";
import { SideNavBar } from "./_components/layout/SideNavBar";

import SessionProvider from "./_components/providers/client/session.provider";
import { GlobalErrorProvider } from "./_components/providers/client/globalError.provider";
import { getServerSession } from "~/lib/lucia/util.lucia";

export const metadata: Metadata = {
  title: "Chessalyze",
  description: "chess with your friends!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { session, user } = await getServerSession();

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-stone-700 text-orange-50" id="root">
        <div className="flex h-[100dvh] w-full flex-row ">
          <SessionProvider session={session} user={user}>
            <GlobalErrorProvider className="flex flex-row">
              <SideNavBar />
              <div className="h-[100dvh] w-full overflow-y-auto p-5">
                {children}
              </div>
            </GlobalErrorProvider>
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
