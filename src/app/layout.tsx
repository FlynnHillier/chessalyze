import type { Metadata } from "next";
import "./globals.css";
import { SideNavBar } from "./_components/layout/SideNavBar";

export const metadata: Metadata = {
  title: "next Chessalyze",
  description: "chess with your friends!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head></head>
      <body className="bg-stone-700 text-orange-50">
        <div className="flex h-screen w-full flex-row">
          <SideNavBar />
          <div className="h-screen w-full p-5">{children}</div>
        </div>
      </body>
    </html>
  );
}
