"use client";

import { useEffect, useMemo } from "react";
import Panel from "~/app/(dynamic)/(protected)/play/(panel)/_components/Panel";
import { useGame } from "~/app/_components/providers/game.provider";
import { VerboseMovement } from "~/types/game.types";
import {
  WhitePieceIcon,
  BlackPieceIcon,
} from "~/app/(dynamic)/(protected)/play/_components/PieceIcon";

export default function LivePanel() {
  const game = useGame();

  /**
   * Paired move history, [white move, black move][]
   */
  const pairedMoveHistory: [VerboseMovement, VerboseMovement?][] =
    useMemo(() => {
      if (!game.game?.moves) return [];

      return game.game.moves.reduce(
        (acc, move, i, array) => {
          if (i % 2 == 0)
            return [...acc, array.slice(i, i + 2)] as [
              VerboseMovement,
              VerboseMovement?,
            ][];

          return acc;
        },
        [] as [VerboseMovement, VerboseMovement?][],
      );
    }, [game.game?.moves]);

  return (
    <Panel>
      <div className="flex flex-col"></div>

      <div className="flex min-h-40 flex-col rounded-sm bg-stone-950 p-3 [&>div:nth-child(odd)]:bg-stone-900">
        {pairedMoveHistory.map(([w, b], i) => {
          return (
            <div className="flex w-full flex-row items-center bg-stone-800 px-1 py-0.5 first:rounded-t-sm last:rounded-b-sm">
              <span className="font-medium">{i + 1}.</span>
              <div className="flex w-1/4 flex-row items-center justify-center gap-0.5 font-bold ">
                {WhitePieceIcon(w.move.piece)} {w.move.target}
              </div>
              <div className="flex w-1/4 flex-row items-center justify-center gap-0.5 font-bold ">
                {b && BlackPieceIcon(b.move.piece)} {b && b.move.target}
              </div>
              <div className="ml-auto grid h-fit flex-grow grid-cols-[1fr_auto] grid-rows-2 gap-x-1">
                <div className="col-span-2 row-span-1  grid grid-cols-subgrid">
                  <div className="col-span-1 flex items-center justify-end">
                    <div
                      className="block h-1/2 rounded-sm bg-gray-300"
                      style={{
                        width: `${100 / (60 / 3.8)}%`,
                      }}
                    />
                  </div>
                  <div className="col-span-1 col-start-2 text-xs">3.8</div>
                </div>
                <div className="col-span-2 row-span-1  grid grid-cols-subgrid">
                  <div className="col-span-1 flex items-center justify-end">
                    <div
                      className="block h-1/2 rounded-sm bg-zinc-700"
                      style={{
                        width: `${100 / (60 / 2.1)}%`,
                      }}
                    />
                  </div>
                  <div className="col-span-1 col-start-2 text-xs">2.1</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
}
