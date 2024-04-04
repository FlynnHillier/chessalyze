"use client";

import { useState } from "react";

import MultiButton from "~/app/_components/common/MultiButton";
import { LobbyPanel } from "~/app/(dynamic)/(protected)/play/(panel)/_components/LobbyPanel";

type Opponent = "online" | "friend";

/**
 * Gives uses opportunity to redirect to other panels.
 */
export default function DefaultPlayPanel() {
  const [opponent, setOpponent] = useState<Opponent>("friend");

  return (
    <>
      <div className="flex w-full flex-col gap-1">
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
        {opponent === "friend" ? <LobbyPanel /> : <>Coming soon!</>}
      </div>
    </>
  );
}
