"use client";

import { ReactNode, useEffect } from "react";
import {
  SERVERGAMECONTEXT,
  useDispatchGame,
} from "../providers/client/game.provider";

//TODO: can minimise / refine type of serverGame (not as much info as is current is required.)

/**
 * A client component which dispatches server game context passed as prop
 *
 */
export default function DispatchServerGameContext({
  children,
  serverGame,
}: {
  children?: ReactNode;
  serverGame: NonNullable<SERVERGAMECONTEXT["game"]>;
}) {
  const dispatchGame = useDispatchGame();

  useEffect(() => {
    dispatchGame({
      type: "LOAD",
      payload: {
        id: serverGame.id,
        moves: serverGame.moves,
        players: serverGame.players,
        time: serverGame.time,
        live: serverGame.live && {
          FEN: serverGame.live.current.fen,
          time: {
            now: Date.now(),
            remaining: serverGame.live.time.remaining,
          },
        },
      },
    });
  }, [serverGame]);

  return <>{children}</>;
}
