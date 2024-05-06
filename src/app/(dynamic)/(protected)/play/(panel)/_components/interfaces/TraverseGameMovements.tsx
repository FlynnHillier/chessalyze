"use client";

import { useRef, useEffect, useMemo } from "react";
import {
  useGame,
  useDispatchGame,
} from "~/app/_components/providers/client/game.provider";
import { VerboseMovement } from "~/types/game.types";
import { WhitePieceIcon, BlackPieceIcon } from "../../../_components/PieceIcon";
import { LuArrowBigLeftDash, LuArrowBigRightDash } from "react-icons/lu";

/**
 * An interface that allows the user to traverse through the movements stored within the current game context
 *
 *
 */
export default function TraverseGameMovements() {
  const game = useGame();
  const dispatchGame = useDispatchGame();

  const viewingMoveRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    //When the 'viewed' move changes, bring it into view.
    viewingMoveRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [game.game?.moves, game.game?.viewing]);

  /**
   * Paired move history, [white move, black move][]
   */
  const pairedMoveHistory: [VerboseMovement?, VerboseMovement?][] =
    useMemo(() => {
      if (!game.game?.moves) return [];

      const moves = game.game.moves.reduce(
        (acc, move, i, array) => {
          if (i % 2 == 0)
            return [...acc, array.slice(i, i + 2)] as [
              VerboseMovement?,
              VerboseMovement?,
            ][];

          return acc;
        },
        [] as [VerboseMovement?, VerboseMovement?][],
      );

      if (game.game.live && game.game.moves.length % 2 === 0) {
        moves.push([undefined, undefined]);
      }

      return moves;
    }, [game.game?.moves]);

  return (
    <div className=" flex h-52 flex-col rounded-sm bg-stone-950 p-3 ">
      <div className="h-full w-full select-none overflow-scroll rounded-sm scrollbar-hide [&>div:nth-child(odd)]:bg-stone-900">
        {pairedMoveHistory.map(([w, b], i) => {
          return (
            <div
              className="flex w-full flex-row items-center gap-1.5 bg-stone-800 px-1 first:rounded-t-sm last:rounded-b-sm"
              key={i}
            >
              <span className="py-0.5 font-medium ">{i + 1}.</span>
              <div
                ref={
                  game.game?.viewing && game.game.viewing.index === i * 2
                    ? viewingMoveRef
                    : null
                }
                className={`flex h-full w-1/4 flex-row items-center justify-center gap-0.5 rounded-sm text-center font-bold ${w ? "hover:cursor-pointer" : ""} ${w && w === game.game?.viewing?.move ? "bg-stone-500" : ""}`}
                onClick={() => {
                  if (w)
                    dispatchGame({
                      type: "STEP",
                      payload: {
                        index: { value: i * 2 },
                      },
                    });
                }}
              >
                {w && WhitePieceIcon(w.move.piece)} {w && w.move.target}
                {w && w.move.promotion ? "+" : ""}
              </div>
              <div
                ref={
                  game.game?.viewing && game.game.viewing.index === i * 2 + 1
                    ? viewingMoveRef
                    : null
                }
                className={`flex h-full w-1/4 flex-row items-center justify-center gap-0.5 rounded-sm text-center font-bold ${b ? "hover:cursor-pointer" : ""} ${b && b === game.game?.viewing?.move ? "bg-stone-500" : ""}`}
                onClick={() => {
                  if (b)
                    dispatchGame({
                      type: "STEP",
                      payload: {
                        index: { value: i * 2 + 1 },
                      },
                    });
                }}
              >
                {b && BlackPieceIcon(b.move.piece)} {b && b.move.target}
                {b && b.move.promotion ? "+" : ""}
              </div>
              <div className="ml-auto grid h-fit flex-grow grid-cols-[1fr_auto] grid-rows-2 gap-x-1">
                <div className="col-span-2 row-span-1  grid grid-cols-subgrid">
                  <div className="col-span-1 flex items-center justify-end">
                    <div
                      className="block h-1/2 rounded-sm bg-gray-300"
                      style={{
                        width: `${w ? Math.min(100, 100 / (60000 / w.time.moveDuration)) : "0"}%`,
                      }}
                    />
                  </div>
                  <div className="col-span-1 col-start-2 text-xs">
                    {w ? (
                      Math.round(w.time.moveDuration / 10) / 100
                    ) : (
                      <>&nbsp;</>
                    )}
                  </div>
                </div>
                <div className="col-span-2 row-span-1  grid grid-cols-subgrid">
                  <div className="col-span-1 flex items-center justify-end">
                    <div
                      className="block h-1/2 rounded-sm bg-zinc-700"
                      style={{
                        width: `${b ? Math.min(100, 100 / (60000 / b.time.moveDuration)) : "0"}%`,
                      }}
                    />
                  </div>
                  <div className="col-span-1 col-start-2 text-xs">
                    {b ? (
                      Math.round(b.time.moveDuration / 10) / 100
                    ) : (
                      <>&nbsp;</>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={game.game?.viewing?.isLatest ? viewingMoveRef : null} />
      </div>
      <div className="flex h-fit w-full flex-row items-center justify-start gap-0.5 py-1">
        <button
          onClick={() => {
            dispatchGame({
              type: "STEP",
              payload: {
                index: {
                  relative: -1,
                },
              },
            });
          }}
          disabled={
            !game.game || game.game?.moves.length <= 0 || !game.game.viewing
          }
          className={`${
            !game.game || game.game?.moves.length <= 0 || !game.game.viewing
              ? "opacity-60"
              : ""
          }`}
        >
          <LuArrowBigLeftDash size={20} />
        </button>
        <button
          onClick={() => {
            dispatchGame({
              type: "STEP",
              payload: {
                index: {
                  relative: 1,
                },
              },
            });
          }}
          disabled={
            !game.game ||
            game.game?.moves.length <= 0 ||
            game.game.viewing?.isLatest
          }
          className={`${
            !game.game ||
            game.game?.moves.length <= 0 ||
            game.game.viewing?.isLatest
              ? "opacity-60"
              : ""
          }`}
        >
          <LuArrowBigRightDash size={20} />
        </button>
      </div>
    </div>
  );
}
