"use client";

import { useState } from "react";
import { useGame } from "~/app/_components/providers/game.provider";
import AsyncButton from "~/app/_components/common/AsyncButton";
import { FiFlag } from "react-icons/fi";
import SyncLoader from "~/app/_components/loading/SyncLoader";
import { trpc } from "~/app/_trpc/client";
import MultiButton from "~/app/_components/common/MultiButton";
import { TRPCClientError } from "@trpc/client";
import { useMutatePanelErrorMessage } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/error.provider";
import ActiveGamePanel from "../../_components/panels/ActiveGamePanel";

function ResignationButton() {
  const [isShowingConfirmation, setIsShowingConfirmation] =
    useState<boolean>(false);
  const game = useGame();
  const { show: showError } = useMutatePanelErrorMessage();

  const trpcResignationSummary = trpc.game.play.resign.useMutation();

  async function resign() {
    if (trpcResignationSummary.isLoading) return;
    try {
      await trpcResignationSummary.mutateAsync();
    } catch (e) {
      if (e instanceof TRPCClientError) {
        showError(e.message);
      } else {
        showError("something went wrong");
      }
    }
  }

  function showConfirmation() {
    setIsShowingConfirmation(true);
  }

  function hideConfirmation() {
    setIsShowingConfirmation(false);
  }

  return !isShowingConfirmation ? (
    <AsyncButton
      isLoading={trpcResignationSummary.isLoading}
      onLoading={<SyncLoader customTailwind="bg-stone-900" />}
      className="rounded bg-stone-700 p-2"
      onClick={showConfirmation}
    >
      <div className="flex flex-row flex-nowrap items-center justify-center gap-1">
        <span className="text-lg font-bold">Resign</span> <FiFlag />
      </div>
    </AsyncButton>
  ) : (
    <div className="flex h-fit w-full flex-col items-center justify-center gap-0.5 rounded bg-stone-700 p-1">
      <span className="text-lg font-bold">Are you sure?</span>
      <MultiButton
        customTailwind={{
          container: "gap-2 py-1 px-2",
          any: {
            any: "rounded p-2 bg-stone-900 hover:bg-stone-950 font-bold tracking-wide",
          },
        }}
        options={{
          resign: {
            //tailwind: { any: { any: "bg-green-600 hover:bg-green-800" } },
          },
          cancel: {
            //tailwind: { any: { any: "bg-stone-800 hover:bg-stone-700" } },
          },
        }}
        onSelection={(selection) => {
          hideConfirmation();
          if (selection === "resign") resign();
        }}
      ></MultiButton>
    </div>
  );
}

export default function LivePanel() {
  return (
    <ActiveGamePanel>
      <ResignationButton />
    </ActiveGamePanel>
  );
}
