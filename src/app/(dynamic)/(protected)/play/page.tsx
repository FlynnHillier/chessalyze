"use client";

import ActivityPanel from "./_components/activity/ActivityPanel";
import ChessInterface from "./_components/game/ChessInterface";

export default function GamePage() {
  return (
    <>
      <div className="flex h-full w-full flex-row gap-6">
        <div className="flex w-full justify-center">
          <ChessInterface />
        </div>
        <div className="flex w-1/3 justify-start">
          <ActivityPanel />
        </div>
      </div>
    </>
  );
}
