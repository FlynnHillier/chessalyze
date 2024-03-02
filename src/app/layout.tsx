import type { Metadata } from "next";
import "./globals.css";

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
        <html lang="en">
            <head>
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
