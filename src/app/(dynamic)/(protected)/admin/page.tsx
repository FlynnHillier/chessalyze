"use client";

import { useEffect, useState } from "react";
import AsyncButton from "~/app/_components/common/buttons/AsyncButton";
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
        disabled={gameID === undefined || gameID === ""}
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

/**
 * Access game summarys related to a player stored in database and log it to client console.
 */
function QueryPlayerGameSummarys() {
  const trpcDevGetPlayerGameSummarys =
    trpc.dev.getPlayerGameSummarys.useMutation();
  const [playerID, setPlayerID] = useState<string>();

  useEffect(() => {
    if (trpcDevGetPlayerGameSummarys.data !== undefined) {
      console.log(trpcDevGetPlayerGameSummarys.data);
    }
  }, [trpcDevGetPlayerGameSummarys.data]);

  useEffect(() => {
    if (trpcDevGetPlayerGameSummarys.error) {
      console.error(trpcDevGetPlayerGameSummarys.error);
    }
  }, [trpcDevGetPlayerGameSummarys.error]);

  return (
    <div className="flex flex-row">
      <input
        className="px-2 text-black outline-none"
        onChange={(e) => {
          setPlayerID(e.target.value);
        }}
        placeholder="player id"
      ></input>
      <AsyncButton
        disabled={playerID === undefined || playerID === ""}
        isLoading={trpcDevGetPlayerGameSummarys.isLoading}
        onLoading={<SyncLoader />}
        onClick={() => {
          if (playerID)
            trpcDevGetPlayerGameSummarys.mutate({ playerID: playerID });
        }}
      >
        get player game summarys
      </AsyncButton>
    </div>
  );
}

/**
 * Access game summarys related to a player stored in database and log it to client console.
 */
function QueryRecentGameSummarys() {
  const trpcDevGetRecentGameSummarys =
    trpc.dev.getRecentGameSummarys.useMutation();

  useEffect(() => {
    if (trpcDevGetRecentGameSummarys.data !== undefined) {
      console.log(trpcDevGetRecentGameSummarys.data);
    }
  }, [trpcDevGetRecentGameSummarys.data]);

  useEffect(() => {
    if (trpcDevGetRecentGameSummarys.error) {
      console.error(trpcDevGetRecentGameSummarys.error);
    }
  }, [trpcDevGetRecentGameSummarys.error]);

  return (
    <div className="flex flex-row">
      <AsyncButton
        isLoading={trpcDevGetRecentGameSummarys.isLoading}
        onLoading={<SyncLoader />}
        onClick={() => {
          trpcDevGetRecentGameSummarys.mutate();
        }}
      >
        get recent game summarys
      </AsyncButton>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-2 [&_button]:rounded [&_button]:bg-stone-800 [&_button]:p-2">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <QueryGameSummary />
      <QueryPlayerGameSummarys />
      <QueryRecentGameSummarys />
    </div>
  );
}
