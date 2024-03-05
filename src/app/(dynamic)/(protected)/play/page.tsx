"use client"

import { useGame } from "~/app/_components/providers/game.provider"

export default function GamePage() {
  const { game } = useGame()

  return (
    <>
      {`${game.present}`}
    </>
  )
}