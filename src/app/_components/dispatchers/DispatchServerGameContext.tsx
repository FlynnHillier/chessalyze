"use client";

import { ReactNode, useEffect } from "react";
import {
  GAMECONTEXT,
  SERVERGAMECONTEXT,
  useDispatchGame,
} from "~/app/_components/providers/client/game.provider";

type GAMECONTEXTGAME = NonNullable<GAMECONTEXT["game"]>;
type GAMECONTEXTGAMELIVE = NonNullable<GAMECONTEXTGAME["live"]>;

export type ServerDispatchPayload = {
  id: GAMECONTEXTGAME["id"];
  moves: GAMECONTEXTGAME["moves"];
  players: GAMECONTEXTGAME["players"];
  time: GAMECONTEXTGAME["time"];
  live?: {
    FEN: GAMECONTEXTGAMELIVE["current"]["fen"];
    time: {
      now: number;
      remaining: GAMECONTEXTGAMELIVE["time"]["remaining"];
    };
  };
};

//TODO: can minimise / refine type of serverGame (not as much info as is current is required.)

/**
 * A client component which dispatches server game context passed as prop
 *
 */
export default function DispatchServerGameContext({
  children,
  payload,
}: {
  children?: ReactNode;
  payload: ServerDispatchPayload;
}) {
  const dispatchGame = useDispatchGame();

  useEffect(() => {
    dispatchGame({
      type: "LOAD",
      payload: {
        id: payload.id,
        moves: payload.moves,
        players: payload.players,
        time: payload.time,
        live: payload.live && {
          FEN: payload.live.FEN,
          time: {
            now: payload.live.time.now,
            remaining: payload.live.time.remaining,
          },
        },
      },
    });
  }, [payload]);

  return <>{children}</>;
}
