"use client";

import { useEffect, useState } from "react";

import { ChessBoard } from "./ChessBoard";
import { useGame } from "~/app/_components/providers/game.provider";
import { Movement, Player, BW, Color } from "~/types/game.types";
import { trpc } from "~/app/_trpc/client";
import { useSession } from "~/app/_components/providers/session.provider";

function GameBanner({ player }: { player?: Player }) {
  return (
    <div className="flex h-full w-full flex-row justify-start bg-stone-800 p-1">
      <div className="text- rounded-lg bg-stone-900 px-2 py-1.5">
        {player?.pid ?? "player"}
      </div>
    </div>
  );
}

export default function ChessInterface() {
  const game = useGame().game.game;
  const { user } = useSession();
  const trpcMoveMutation = trpc.game.move.useMutation();
  const [orientation, setOrientation] = useState<Color>("w");

  useEffect(() => {
    setOrientation(user?.id === game?.players.b.pid ? "b" : "w");
  }, [user, game?.players.b.pid, game?.players.w.pid]);

  async function onMovement(move: Movement) {
    const { success } = await trpcMoveMutation.mutateAsync({
      move: move,
    });
    return success;
  }

  return (
    <div className="flex h-full w-full max-w-xl flex-col">
      <div className="h-1/6 w-full">
        <GameBanner
          player={orientation === "w" ? game?.players.w : game?.players.b}
        />
      </div>
      <div className="w-full">
        <ChessBoard
          turn={game?.state.turn}
          FEN={
            game?.state.fen ??
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          }
          getValidMoves={game?.engine.getValidMoves}
          onMovement={onMovement}
          orientation={orientation}
          disabled={!game || game.state.turn !== orientation}
        />
      </div>
      <div className="w-ful h-1/6">
        <GameBanner
          player={orientation === "b" ? game?.players.b : game?.players.w}
        />
      </div>
    </div>
  );
}
