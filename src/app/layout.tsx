import type { Metadata } from "next";
import "./globals.css";
import { SideNavBar } from "./_components/common/SideNavBar";

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
      <body className="dark:bg-stone-700 dark:text-orange-50">
        <div className="flex h-full w-full flex-row gap-3">
          <SideNavBar />
          {children}
        </div>
      </body>
    </html>
  );
}
