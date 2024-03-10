import { getServerSession } from "next-auth";
import { ReactNode } from "react";
import { authOptions } from "~/server/auth";
import { redirect } from "next/navigation";
import { GameProvider } from "~/app/_components/providers/game.provider";
import { LobbyProvider } from "~/app/_components/providers/lobby.provider";

export default async function RestrictedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <>
      <LobbyProvider>
        <GameProvider>
          {children}
        </GameProvider>
      </LobbyProvider>
    </>
  )
}