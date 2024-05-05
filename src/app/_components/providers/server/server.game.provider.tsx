"use server";

import { GameProvider, SERVERGAMECONTEXT } from "../client/game.provider";
import { GameMaster } from "~/lib/game/GameMaster";
import { getServerSession } from "~/lib/lucia/util.lucia";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { GameInstance } from "~/lib/game/GameInstance";

/**
 * Convert a given game instance to a live game context object
 *
 * @param instance instance to be converted to game context
 * @returns game context object
 */
const gameInstanceToServerGameContext = (
  instance: GameInstance,
): SERVERGAMECONTEXT => ({
  game: {
    id: instance.id,
    moves: instance.getMoveHistory(),
    players: instance.players,
    time: {
      start: instance.getTimeData().start,
    },
    live: {
      current: {
        fen: instance.getFEN(),
        turn: instance.getTurn(),
      },
      engine: {},
      time: {
        lastUpdated: Date.now(),
        remaining: instance.getRemainingTimes(),
      },
    },
  },
});

/**
 * Provide game context with the intial context loaded from the server
 *
 */
export default async function ServerGameProvider({
  children,
}: {
  children?: ReactNode;
}) {
  const { user } = await getServerSession();

  if (!user) redirect("/"); // Should not happen

  const game = GameMaster.instance().getByPlayer(user.id);

  return (
    <GameProvider
      initial={game ? gameInstanceToServerGameContext(game) : undefined}
    >
      {children}
    </GameProvider>
  );
}
