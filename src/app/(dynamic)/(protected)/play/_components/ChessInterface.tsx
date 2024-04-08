"use client";

import { useEffect, useMemo, useState } from "react";
import { useInterval } from "usehooks-ts";

import { ChessBoard } from "./ChessBoard";
import { useGame } from "~/app/_components/providers/game.provider";
import { Movement, Player, BW, Color } from "~/types/game.types";
import { trpc } from "~/app/_trpc/client";
import { useSession } from "~/app/_components/providers/session.provider";
import { FaChessKing, FaChess } from "react-icons/fa";
import { FaRegChessKing } from "react-icons/fa6";

/**
 * Overlay shown when game is over.
 *
 * Should display brief information about how & why the game ended.
 */
function GameEndOverlay({
  isShown,
  reason,
  victor,
  hideSelf,
}: {
  isShown: boolean;
  reason?: string;
  victor?: Color | null;
  hideSelf?: () => any;
}) {
  const [verboseVictor, setVerboseVictor] = useState<
    "white" | "black" | "draw"
  >();
  const [icon, setIcon] = useState<JSX.Element>();

  useEffect(() => {
    if (victor === null) {
      setVerboseVictor("draw");
      setIcon(<FaChess />);
    } else if (victor === "w") {
      setVerboseVictor("white");
      setIcon(<FaRegChessKing />);
    } else if (victor === "b") {
      setVerboseVictor("black");
      setIcon(<FaChessKing />);
    } else {
      setIcon(undefined);
    }
  }, [victor]);

  return (
    <div
      className={`z-10 flex h-full w-full items-center justify-center bg-black bg-opacity-60 ${isShown ? "" : "hidden"}`}
      onClick={hideSelf}
    >
      <div className="relative h-fit w-2/5 text-wrap rounded-md bg-white px-2 py-3 text-center text-lg font-semibold text-black">
        <div
          className="absolute left-0 top-0 aspect-square w-1/6 select-none text-gray-500 hover:cursor-pointer hover:text-gray-600"
          onClick={hideSelf}
        >
          x
        </div>

        <span className="font-bold"> Game over!</span>
        <br />
        {`${verboseVictor ?? verboseVictor !== "draw" ? `${verboseVictor} wins` : `${verboseVictor}`} by ${reason}`}
        <div className="flex w-full items-center justify-center">{icon}</div>
      </div>
    </div>
  );
}

/**
 * Display player of game's name & their remaining time
 *
 * @param player player on 'this side of the board'
 * @param time remaining time for specified player
 */
function GameBanner({ player, time }: { player?: Player; time?: number }) {
  /**
   * Timestamp string generated from passed ms number
   *
   * Timestamp includes ms if time < 10 seconds
   */
  const timestamp: string | undefined = useMemo(() => {
    if (!time) return;
    const ts = new Date(time);
    const [minutes, seconds, milliseconds] = [
      ts.getMinutes().toString().padStart(2, "0"),
      ts.getSeconds().toString().padStart(2, "0"),
      ts.getMilliseconds().toString().padStart(2, "0").substring(0, 2),
    ];

    if (time < 10000) return `${minutes}:${seconds}:${milliseconds}`;

    return `${minutes}:${seconds}`;
  }, [time]);

  return (
    <div className="flex h-full w-full flex-row justify-between bg-inherit py-1 font-semibold">
      <div className="w-1/5 min-w-fit rounded-lg bg-stone-900 px-2 py-1.5 text-center">
        {player?.username ?? "player"}
      </div>
      <div className="w-1/5 rounded-lg bg-stone-900 px-2 py-1.5 text-center">
        {timestamp ?? "00:00"}
      </div>
    </div>
  );
}

/**
 * Allow interaction with chess board and server
 *
 */
export default function ChessInterface() {
  const game = useGame().game;
  const conclusion = useGame().conclusion;
  const { user } = useSession();
  const trpcMoveMutation = trpc.game.move.useMutation();
  const [orientation, setOrientation] = useState<Color>("w");
  const [showGameEndOverlay, setShowGameEndOverlay] =
    useState<boolean>(!!conclusion);
  const [time, setTime] = useState<BW<number>>();
  const [clockUpdateInterval, setClockUpdateInterval] = useState<number | null>(
    null,
  );

  /**
   * When game context time is updated, push update to state also.
   */
  useEffect(() => {
    setTime(game?.time.remaining);
  }, [game?.time.lastUpdated]);

  /**
   * Dictate the interval at which the currently active clock is updated at.
   *
   * If in game, set the interval to a medium speed unless we are below 10 seconds at which point, update rapidly.
   *
   * If not in game, clear interval.
   *
   */
  useEffect(() => {
    setClockUpdateInterval(() => {
      if (!time || !game) return null;

      if (time[game.state.turn] < 10000) return 100;

      return 250;
    });
  }, [time?.w, time?.b]);

  /**
   * Actively update clock state for currently active clock
   *
   * Only runs when game is present & is timed.
   */
  useInterval(() => {
    setTime((prev) => {
      if (!game?.time.remaining) return undefined;

      return {
        w: prev?.w ?? game.time.remaining.w,
        b: prev?.b ?? game.time.remaining.b,
        [game.state.turn]:
          game.time.remaining[game.state.turn] -
          (Date.now() - game.time.lastUpdated),
      };
    });
  }, clockUpdateInterval);

  useEffect(() => {
    setShowGameEndOverlay(!!conclusion);
  }, [conclusion]);

  /**
   *  Decide and set board orientation based on the current match's players.
   */
  useEffect(() => {
    setOrientation(user?.id === game?.players.b.pid ? "b" : "w");
  }, [user, game?.players.b.pid, game?.players.w.pid]);

  /**
   *
   * @param move movement that has occured
   * @returns Promise<boolean> true if move was a success
   */
  async function onMovement(move: Omit<Movement, "piece">): Promise<boolean> {
    const { success } = await trpcMoveMutation.mutateAsync({
      move: move,
    });
    return success;
  }

  return (
    <div className="flex h-full w-full max-w-2xl flex-col rounded-lg bg-stone-800 px-2">
      <div className="h-1/6 w-full">
        <GameBanner
          player={orientation === "b" ? game?.players.w : game?.players.b}
          time={time?.[orientation === "b" ? "w" : "b"]}
        />
      </div>
      <div className="grid w-full grid-cols-1 grid-rows-1 [&>div]:col-start-1 [&>div]:row-start-1 ">
        <ChessBoard
          turn={game?.state.turn}
          FEN={
            game?.state.fen ??
            conclusion?.conclusion.boardState ??
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          }
          getValidMoves={game?.engine.getValidMoves}
          onMovement={onMovement}
          orientation={orientation}
          disabled={!game || game.state.turn !== orientation}
        />
        <GameEndOverlay
          isShown={showGameEndOverlay}
          hideSelf={() => {
            setShowGameEndOverlay(false);
          }}
          reason={conclusion?.conclusion.termination}
          victor={conclusion?.conclusion.victor}
        />
      </div>
      <div className="w-ful h-1/6">
        <GameBanner
          time={time?.[orientation === "b" ? "b" : "w"]}
          player={orientation === "b" ? game?.players.b : game?.players.w}
        />
      </div>
    </div>
  );
}
