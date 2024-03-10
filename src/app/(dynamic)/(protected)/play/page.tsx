"use client";
import { useGame } from "~/app/_components/providers/game.provider";
import { useLobby } from "~/app/_components/providers/lobby.provider";

export default function GamePage() {
  const { game } = useGame();
  const { lobby } = useLobby();

  return (
    <>
  );
}
