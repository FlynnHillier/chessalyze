"use client";

import { useState } from "react";
import { FaRegCopy } from "react-icons/fa";
import { IoMdCheckmarkCircle } from "react-icons/io";
import MultiButton from "~/app/_components/common/MultiButton";

type Opponent = "online" | "friend";

function FriendPanel() {
  const [hasCopiedChallengeLink, setHasCopiedChallengeLink] = useState<boolean>(false);

  function copyChallengeLink() {
    setHasCopiedChallengeLink(true);
    navigator.clipboard.writeText("invite link to chess");
  }

  return (
    <div className="flex h-fit w-full flex-col gap-1 text-gray-100">
      <button
        className="flex flex-row items-center justify-center gap-1 rounded bg-stone-600 px-1 py-1.5 text-base font-semibold text-white hover:bg-stone-700"
        onClick={copyChallengeLink}
      >
        {hasCopiedChallengeLink ? <IoMdCheckmarkCircle /> : <FaRegCopy />}
        Copy Challenge Link
      </button>
      <div className="text-sm">
        {hasCopiedChallengeLink ? "send the link to your opponent!" : ""}
      </div>
    </div>
  );
}
export default function ActivityPanel() {
  const [opponent, setOpponent] = useState<Opponent>("friend");

  return (
    <div className="container h-fit w-full overflow-hidden rounded bg-stone-800 pt-2 text-center">
      <div className="flex flex-col gap-2">
        <div className="w-full text-xl font-bold">
          <h1>Play chess!</h1>
        </div>
        <div className="w-full p-2">
          <MultiButton<Opponent>
            options={{
              friend: "friend",
              online: "online",
            }}
            selected={opponent}
            onSelection={setOpponent}
            customTailwind={{
              selected: "bg-green-700 hover:bg-green-600",
              nonSelected: "bg-stone-900 hover:bg-stone-950",
              all: "rounded px-1 py-1.5 font-semibold text-lg",
            }}
          />
        </div>
        <div className="rounde bg-stone-900 p-2">
          {opponent === "friend" ? <FriendPanel /> : <>Coming soon!</>}
        </div>
      </div>
    </div>
  );
}
