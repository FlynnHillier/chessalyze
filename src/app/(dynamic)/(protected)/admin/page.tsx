"use client";

import { useEffect, useState } from "react";
import AsyncButton from "~/app/_components/common/AsyncButton";
import SyncLoader from "~/app/_components/loading/SyncLoader";
import { trpc } from "~/app/_trpc/client";

/**
 * Access a game summary stored in database and log it to client console.
 */
function QueryGameSummary() {
  const trpcDevGetGameSummary = trpc.dev.getGameSummary.useMutation();
  const [gameID, setGameID] = useState<string>();

  useEffect(() => {
    if (trpcDevGetGameSummary.data !== undefined) {
      console.log(trpcDevGetGameSummary.data);
    }
  }, [trpcDevGetGameSummary.data]);

  useEffect(() => {
    if (trpcDevGetGameSummary.error) {
      console.error(trpcDevGetGameSummary.error);
    }
  }, [trpcDevGetGameSummary.error]);

  return (
    <div className="flex flex-row">
      <input
        className="px-2 text-black outline-none"
        onChange={(e) => {
          setGameID(e.target.value);
        }}
        placeholder="game id"
      ></input>
      <AsyncButton
        disabled={gameID === undefined}
        isLoading={trpcDevGetGameSummary.isLoading}
        onLoading={<SyncLoader />}
        onClick={() => {
          if (gameID) trpcDevGetGameSummary.mutate({ gameID: gameID });
        }}
      >
        get game summary
      </AsyncButton>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="[&_button]:rounded [&_button]:bg-stone-800 [&_button]:p-2">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <QueryGameSummary />
    </div>
  );
}
