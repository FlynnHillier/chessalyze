"use server";

import GameSummarysOverview from "./_components/game/summary/GameSummaryPill";
import { serverClient } from "~/app/_trpc/serverClient";

export default async function Home() {
  return (
    <main>
      <GameSummarysOverview
        summarys={await serverClient.game.summary.recent()}
      />
    </main>
  );
}
