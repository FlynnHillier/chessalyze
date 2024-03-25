"use client";

import { TRPCError } from "@trpc/server";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useGame } from "~/app/_components/providers/game.provider";
import { useLobby } from "~/app/_components/providers/lobby.provider";
import { trpc } from "~/app/_trpc/client";

export default function JoinPage() {
  const { lobby, dispatchLobby } = useLobby();
  const { dispatchGame } = useGame();
  const searchParams = useSearchParams();
  const JoinLobbyMutation = trpc.lobby.join.useMutation();

  async function attemptJoinLobby(id: string) {
    try {
      const existingLobby = lobby.present; //TODO: this will always be false (race condition as context intial value not yet loaded)
      const { game } = await JoinLobbyMutation.mutateAsync({
        lobby: { id: id },
      });

      if (existingLobby) dispatchLobby({ type: "END", payload: {} });

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
    if (!target) return;

    attemptJoinLobby(target);
  }, []);

  //TODO: add actual UI here
  // - once friends are added, option to invite friends appears here.
  return (
    <>
      join lobby page. <br />
      {JoinLobbyMutation.isLoading ? (
        <>
          loading... <br />
        </>
      ) : (
        ""
      )}
      {JoinLobbyMutation.error
        ? `an error occured: '${JoinLobbyMutation.error.message}'`
        : ""}
    </>
  );
}
