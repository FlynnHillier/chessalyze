"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Panel from "~/app/(dynamic)/(protected)/play/(panel)/_components/Panel";
import { useGame } from "~/app/_components/providers/game.provider";
import { VerboseMovement } from "~/types/game.types";
import {
  WhitePieceIcon,
  BlackPieceIcon,
  PieceIcon,
} from "~/app/(dynamic)/(protected)/play/_components/PieceIcon";
import AsyncButton from "~/app/_components/common/AsyncButton";
import { FiFlag } from "react-icons/fi";
import SyncLoader from "~/app/_components/loading/SyncLoader";
import { trpc } from "~/app/_trpc/client";
import MultiButton from "~/app/_components/common/MultiButton";
import { TRPCClientError } from "@trpc/client";
import { useMutatePanelErrorMessage } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/error.provider";

function ResignationButton() {
  const [isShowingConfirmation, setIsShowingConfirmation] =
    useState<boolean>(false);
  const game = useGame();
  const { show: showError } = useMutatePanelErrorMessage();

  const trpcResignationSummary = trpc.game.resign.useMutation();

  async function resign() {
    if (trpcResignationSummary.isLoading) return;
    try {
      await trpcResignationSummary.mutateAsync();
    } catch (e) {
      if (e instanceof TRPCClientError) {
        showError(e.message);
      } else {
        showError("something went wrong");
      }
    }
  }

  function showConfirmation() {
    setIsShowingConfirmation(true);
  }

  function hideConfirmation() {
    setIsShowingConfirmation(false);
  }

  return !isShowingConfirmation ? (
    <AsyncButton
      isLoading={trpcResignationSummary.isLoading}
      onLoading={<SyncLoader customTailwind="bg-stone-900" />}
      className="rounded bg-stone-700 p-2"
      onClick={showConfirmation}
    >
      <div className="flex flex-row flex-nowrap items-center justify-center gap-1">
        <span className="text-lg font-bold">Resign</span> <FiFlag />
      </div>
    </AsyncButton>
  ) : (
    <div className="flex h-fit w-full flex-col items-center justify-center gap-0.5 rounded bg-stone-700 p-1">
      <span className="text-lg font-bold">Are you sure?</span>
      <MultiButton
        customTailwind={{
          container: "gap-2 py-1 px-2",
          any: {
            any: "rounded p-2 bg-stone-900 hover:bg-stone-950 font-bold tracking-wide",
          },
        }}
        options={{
          resign: {
            //tailwind: { any: { any: "bg-green-600 hover:bg-green-800" } },
          },
          cancel: {
            //tailwind: { any: { any: "bg-stone-800 hover:bg-stone-700" } },
          },
        }}
        onSelection={(selection) => {
          hideConfirmation();
          if (selection === "resign") resign();
        }}
      ></MultiButton>
    </div>
  );
}

export default function LivePanel() {
  const game = useGame();

  const movesScrollEndRef = useRef<null | HTMLSpanElement>(null);

  useEffect(() => {
    //When a new move happens bring it into view.
    movesScrollEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [game.game?.moves]);

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

      if (game.game.moves.length % 2 === 0) {
        moves.push([undefined, undefined]);
      }

      return moves;
    }, [game.game?.moves]);

  return (
    <Panel>
      {game.game && (
        <div className="flex flex-row items-center justify-center gap-2">
          {PieceIcon("k", game.game.state.turn)}
          <span className="text-lg font-bold">
            {game.game?.state.turn === "w" ? "white" : "black"} to move
          </span>
        </div>
      )}

      <div className=" flex h-52 flex-col rounded-sm bg-stone-950 p-3 ">
        <div className="scrollbar-hide h-full w-full overflow-scroll rounded-sm [&>div:nth-child(odd)]:bg-stone-900">
          {pairedMoveHistory.map(([w, b], i) => {
            return (
              <div className="flex w-full flex-row items-center gap-3 bg-stone-800 px-1 py-0.5 first:rounded-t-sm last:rounded-b-sm">
                <span className="font-medium">{i + 1}.</span>
                <span className="font-bold">&nbsp;</span>
                <div className="flex w-1/4 flex-row items-center justify-start gap-0.5 font-bold ">
                  {w && WhitePieceIcon(w.move.piece)} {w && w.move.target}
                  {w && w.move.promotion ? "+" : ""}
                </div>
                <div className="flex w-1/4 flex-row items-center justify-start gap-0.5 font-bold ">
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
          <span ref={movesScrollEndRef} />
        </div>
      </div>
      {game.game && <ResignationButton />}
    </Panel>
  );
}
