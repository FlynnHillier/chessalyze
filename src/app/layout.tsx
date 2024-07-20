import type { Metadata } from "next";
import "./globals.css";
import { SideNavBar } from "./_components/layout/SideNavBar";

import SessionProvider from "./_components/providers/client/session.provider";
import { getServerSession } from "~/lib/lucia/util.lucia";

export const metadata: Metadata = {
  title: "next Chessalyze",
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
      <head></head>
      <body className="bg-stone-700 text-orange-50">
        <div className="flex h-screen w-full flex-row ">
          <SessionProvider session={session} user={user}>
            <SideNavBar />
            <div className="h-screen w-full overflow-y-auto p-3 lg:p-5">
              {children}
            </div>
          </SessionProvider>
        </div>
      </body>
    </html>
  );
}
