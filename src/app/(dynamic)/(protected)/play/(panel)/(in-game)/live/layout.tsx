"use client";

import { ReactNode } from "react";

import { useGame } from "~/app/_components/providers/client/game.provider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Ensure player is in a game
 */
export default function LiveLayout({ children }: { children: ReactNode }) {
  const game = useGame();
  const router = useRouter();

  useEffect(() => {
    if (game.game?.live) return;
    if (game.game && !game.game.live) router.push(`/play/view/${game.game.id}`);
    else router.push("/play");
  }, [game.game, game.game?.live]);

  return <>{children}</>;
}
