"use client";

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { GameProvider } from "~/app/_components/providers/game.provider";
import { LobbyProvider } from "~/app/_components/providers/lobby.provider";
import SessionProvider, {
  useSession,
} from "~/app/_components/providers/session.provider";

export default async function RestrictedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, user } = await useSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <SessionProvider session={session} user={user}>
      <LobbyProvider>
        <GameProvider>{children}</GameProvider>
      </LobbyProvider>
    </SessionProvider>
  );
}
