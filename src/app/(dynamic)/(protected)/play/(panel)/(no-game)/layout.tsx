"use server";

import { GameMaster } from "~/lib/game/GameMaster";
import { getServerSession } from "~/lib/lucia/util.lucia";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { RedirectIfGameContextLive } from "~/app/_components/controllers/client/RedirectIfGameContext";

export default async function NotInGamePanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await getServerSession();

  if (!user) return <></>;

  if (GameMaster.instance().getByPlayer(user.id)) {
    redirect("/play/live");
  }

  return (
    <>
      <RedirectIfGameContextLive />
      {children}
    </>
  );
}
