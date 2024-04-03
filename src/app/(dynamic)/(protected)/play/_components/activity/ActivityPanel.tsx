"use client";

import { useState } from "react";
import MultiButton from "~/app/_components/common/MultiButton";

import { LobbyPanel } from "~/app/(dynamic)/(protected)/play/_components/activity/LobbyPanel";

type Opponent = "online" | "friend";

export default function ActivityPanel() {
  const [opponent, setOpponent] = useState<Opponent>("friend");

  return (
    <div className="container h-fit w-full overflow-hidden rounded bg-stone-800 pt-2 text-center">
      <div className="flex flex-col">
        <div className="text-gra text-green w-full pb-2 text-3xl font-bold">
          <h1>Play chess!</h1>
          <span className="text-xl font-bold tracking-wider">VS</span>
        </div>
        <div className="w-full">
          <MultiButton<Opponent>
            options={{
              friend: {},
              online: {},
            }}
            selected={opponent}
            onSelection={setOpponent}
            customTailwind={{
              any: {
                isSelected: "bg-stone-900",
                nonSelected: "bg-stone-800 hover:bg-stone-950",
                any: "px-1 py-1.5 font-semibold text-xl",
              },
            }}
          />
        </div>
        <div className="rounded bg-stone-900 p-2">
          {opponent === "friend" ? <LobbyPanel /> : <>Coming soon!</>}
        </div>
      </div>
    </div>
  );
}
