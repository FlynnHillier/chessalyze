"use client";

import { useEffect } from "react";
import { useGame } from "../../providers/client/game.provider";
import { useRouter } from "next/navigation";

/**
 * A client component that will redirect the user to the page specified if the game context updates to be 'live'
 *
 */
export function RedirectIfGameContextLive({ to }: { to?: string }) {
  const router = useRouter();
  const game = useGame();

  useEffect(() => {
    if (game.game?.live) router.push(to ?? "/play/live");
  }, [game.game?.live]);
  return <></>;
}
