"use client";

import { ReactNode } from "react";

import { useGame } from "~/app/_components/providers/game.provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Ensure player is in a game
 */
export default function LiveLayout({ children }: { children: ReactNode }) {
  const game = useGame();
  const router = useRouter();

  useEffect(() => {
    if (!game.game) router.push("/play");
  }, [game.game]);

  return <>{children}</>;
}
