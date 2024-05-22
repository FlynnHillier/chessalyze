"use server";

import { GameSummarysScroller } from "./_components/game/summary/GameSummaryPill";
import { serverClient } from "~/app/_trpc/serverClient";

export default async function Home() {
  return (
    <GameSummarysScroller summarys={await serverClient.game.summary.recent()} />
  );
}
