"use client";

import { useState } from "react";
import { FaRegCopy } from "react-icons/fa";
import { IoIosLink } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { useLobby } from "~/app/_components/providers/lobby.provider";
import { trpc } from "~/app/_trpc/client";
import { TRPCError } from "@trpc/server";
import SyncLoader from "~/app/_components/loading/SyncLoader";
import MultiButton from "~/app/_components/common/MultiButton";
import AsyncButton from "~/app/_components/common/AsyncButton";

type Opponent = "online" | "friend";

function FriendPanel() {
  const { lobby, dispatchLobby } = useLobby();
  const createLobbyMutation = trpc.lobby.create.useMutation();
  const leaveLobbyMutation = trpc.lobby.leave.useMutation();

  async function cancelLobby() {
    if (!lobby.present) return;

    try {
      const r = await leaveLobbyMutation.mutateAsync();
      dispatchLobby({
        type: "END",
        payload: {},
      });
    } catch (e) {
      if (e instanceof TRPCError) {
      }
    }
  }

  async function generateLobby() {
    try {
      const r = await createLobbyMutation.mutateAsync();
      dispatchLobby({
        type: "START",
        payload: {
          lobby: {
            id: r.lobby.id,
          },
        },
      });
    } catch (e) {
      if (e instanceof TRPCError) {
        //handle error
      }
    }
  }

  function copyChallengeLink() {
    if (lobby.lobby?.id)
      navigator.clipboard.writeText(
        `${window.location.origin}/play/join?challenge=${lobby.lobby.id}`,
      );
  }

  return (
    <div className="flex h-fit w-full flex-col gap-1 text-gray-100">
      {lobby.present ? (
        <div className="flex flex-col gap-2">
          <div className="flex flex-row items-center overflow-hidden rounded bg-stone-600">
            <div className="flex w-full flex-row">
              <AsyncButton
                isLoading={leaveLobbyMutation.isLoading}
                onLoading={<SyncLoader customTailwind="bg-stone-800" />}
                onClick={cancelLobby}
                customTailwind={{
                  enabled: "hover:bg-stone-700",
                }}
                className="flex flex-row items-center justify-center gap-1 text-wrap bg-stone-600 px-3 py-1.5 text-lg font-semibold text-white"
              >
                <MdCancel />
              </AsyncButton>
              <div className="w-full px-2 py-2 text-center text-lg font-semibold">
                awaiting opponent
              </div>
            </div>
          </div>
          <div className="flex w-full justify-center">
            <div
              className="flex w-fit items-center justify-center gap-1 hover:cursor-pointer"
              onClick={copyChallengeLink}
            >
              <FaRegCopy />
              <div className="hover:cursor-pointer">copy challenge link</div>
            </div>
          </div>
        </div>
      ) : (
        <AsyncButton
          isLoading={createLobbyMutation.isLoading}
          onLoading={<SyncLoader customTailwind="bg-stone-800" />}
          onClick={generateLobby}
          customTailwind={{
            enabled: "hover:bg-stone-700",
          }}
          className="flex h-full w-full flex-row items-center justify-center gap-1 text-wrap rounded bg-stone-600 px-3 py-2 text-lg font-semibold text-white"
        >
          <IoIosLink />
          generate challenge link
        </AsyncButton>
      )}
    </div>
  );
}

export default function ActivityPanel() {
  const [opponent, setOpponent] = useState<Opponent>("friend");

  return (
    <div className="container h-fit w-full overflow-hidden rounded bg-stone-800 pt-2 text-center">
      <div className="flex flex-col gap-2">
        <div className="w-full text-3xl font-bold">
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
              selected: "bg-green-600 hover:bg-green-700",
              nonSelected: "bg-stone-900 hover:bg-stone-950",
              all: "rounded px-1 py-1.5 font-semibold text-xl",
            }}
          />
        </div>
        <div className="rounded bg-stone-900 p-2">
          {opponent === "friend" ? <FriendPanel /> : <>Coming soon!</>}
        </div>
      </div>
    </div>
  );
}
