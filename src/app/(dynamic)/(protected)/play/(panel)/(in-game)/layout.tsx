"use server";

import { GameMaster } from "~/lib/game/GameMaster";
import { getServerSession } from "~/lib/lucia/util.lucia";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function InGamePanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = await getServerSession();

  if (!GameMaster.instance().getByPlayer(user!.id)) {
    redirect("/play");
  }

  return <>{children}</>;
}
