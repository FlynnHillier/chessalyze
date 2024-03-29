import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { GameProvider } from "~/app/_components/providers/game.provider";
import { LobbyProvider } from "~/app/_components/providers/lobby.provider";

import { getServerSession } from "~/lib/lucia/util.lucia";

export default async function RestrictedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await getServerSession();

  if (!user) {
    // User is not logged in
    redirect("auth/login");
  }

  return (
    <LobbyProvider>
      <GameProvider>{children}</GameProvider>
    </LobbyProvider>
  );
}
