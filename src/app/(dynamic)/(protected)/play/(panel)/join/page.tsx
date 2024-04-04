"use client";

import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useDispatchGame,
  useGame,
} from "~/app/_components/providers/game.provider";
import { trpc } from "~/app/_trpc/client";
import { LobbyConfig } from "~/lib/game/LobbyInstance";
import { FaChessKing } from "react-icons/fa";

import SyncLoader from "~/app/_components/loading/SyncLoader";

/**
 * Allow user to view & accept challenge
 *
 */
export default function JoinPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const game = useGame();
  const dispatchGame = useDispatchGame();

  const trpcJoinLobbyMutation = trpc.lobby.join.useMutation();
  const trpcQueryLobbyMutation = trpc.lobby.query.useMutation();

  const [error, showError] = useState<string>();
  const [target, setTarget] = useState<{
    id: string;
    config: Pick<LobbyConfig, "time" | "color">;
  }>();

  async function queryLobby(lobbyID: string) {
    try {
      if (trpcQueryLobbyMutation.isLoading) return;

      const { exists, lobby } = await trpcQueryLobbyMutation.mutateAsync({
        lobby: {
          id: lobbyID,
        },
      });

      if (!exists || !lobby) return showError("challenge does not exist");

      setTarget({
        id: lobby.id,
        config: {
          color: lobby.config.color,
          time: lobby.config.time,
        },
      });
    } catch (e) {
      if (e instanceof TRPCClientError) showError(e.message);
      else showError("something went wrong");
    }
  }

  async function joinLobby(lobbyID: string) {
    try {
      if (trpcJoinLobbyMutation.isLoading) return;

      const { game } = await trpcJoinLobbyMutation.mutateAsync({
        lobby: { id: lobbyID },
      });

      dispatchGame({
        type: "LOAD",
        payload: {
          present: true,
          game: {
            id: game.id,
            captured: game.captured,
            players: game.players,
            FEN: game.FEN,
            time: game.time,
          },
        },
      });
    } catch (e) {
      if (e instanceof TRPCError) {
      }
    }
  }

  useEffect(() => {
    const target = searchParams.get("challenge");
    if (!target || game.present) return;

    joinLobby(target);
  }, []);

  useEffect(() => {
    if (game.present) router.push("/play");
  }, [game.present]);

  //TODO: add actual UI here
  // - once friends are added, option to invite friends appears here.
  return (
    <>
      <div className="h-fit w-full bg-stone-800">
        <span className="text-nowrap text-lg font-bold">Accept challenge?</span>
      </div>
      <div className="flex h-fit w-1/2 min-w-fit flex-col items-center gap-2 overflow-hidden rounded bg-inherit text-center font-semibold">
        <div className="flex flex-col items-center justify-center gap-1 p-3 text-center font-semibold">
          {trpcQueryLobbyMutation.isLoading && (
            <div className="flex w-full flex-col justify-center font-semibold">
              {"loading details..."}
              <div className="w-full">
                <SyncLoader customTailwind="bg-stone-600" />
              </div>
            </div>
          )}
          You play as
          <div className="flex h-full w-fit flex-row items-center justify-center gap-1 rounded border-2 border-green-600 bg-black px-3 py-1.5">
            <FaChessKing />
            black
          </div>
        </div>
      </div>
    </>
  );
}
