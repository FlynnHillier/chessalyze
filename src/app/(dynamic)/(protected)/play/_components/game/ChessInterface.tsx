"use client";

import { useState } from "react";

import { ChessBoard } from "./ChessBoard";
import { useGame } from "~/app/_components/providers/game.provider";
import { Movement, Player, BW, Color } from "~/types/game.types";
import { Chess } from "chess.js";
import { trpc } from "~/app/_trpc/client";

function GameBanner({ player }: { player?: Player }) {
  return (
    <div className="flex h-full w-full flex-row justify-start bg-stone-800 p-1">
      <div className="text- rounded-lg bg-stone-900 px-2 py-1.5">
        {player?.pid ?? "player"}
      </div>
      <div className="flex w-full justify-end">
        <div className="rounded-lg bg-stone-900 px-2 py-1.5">
          {player?.pid ?? "player"}
        </div>
      </div>
    </div>
  );
}

export default function ChessInterface({
  players = {},
  orientation = "w",
}: {
  players?: Partial<BW<Player>>;
  orientation?: Color;
}) {
  const { game } = useGame();
  const [FEN, setFEN] = useState<string>(new Chess().fen());
  const trpcMoveMutation = trpc.game.move.useMutation();

  async function onMovement(move: Movement) {
    const { success } = await trpcMoveMutation.mutateAsync({
      move: move,
    });

    if (success && game.game) {
      game.game.engine.instance.move({
        from: move.source,
        to: move.target,
        promotion: move.promotion,
      });

      setFEN(game.game.engine.instance.fen());
    }

    return success;
  }

  return (
    <div className="flex h-full w-full max-w-xl flex-col">
      <div className="h-1/6 w-full">
        <GameBanner player={orientation === "w" ? players.b : players.w} />
      </div>
      <div className="w-full">
        <ChessBoard
          FEN={FEN}
          chess={game.game?.engine.instance}
          onMovement={onMovement}
          orientation={orientation}
          disabled={!game.present}
        />
      </div>
      <div className="w-ful h-1/6">
        <GameBanner player={orientation === "w" ? players.w : players.b} />
      </div>
    </div>
  );
}
