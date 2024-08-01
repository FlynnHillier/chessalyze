"use client";

import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  useDispatchGame,
  useGame,
} from "~/app/_components/providers/client/game.provider";
import { trpc } from "~/app/_trpc/client";
import { LobbyConfig } from "~/lib/game/LobbyInstance";
import Panel from "~/app/(dynamic)/(protected)/play/(panel)/_components/Panel";
import { useMutatePanelErrorMessage } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/error.provider";
import SyncLoader from "~/app/_components/loading/SyncLoader";
import LobbyConfigurationInterface from "~/app/(dynamic)/(protected)/play/(panel)/_components/LobbyConfiguration";
import AsyncButton from "~/app/_components/common/buttons/AsyncButton";

/**
 * Allow user to view & accept challenge
 *
 */
export default function JoinPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show: showError } = useMutatePanelErrorMessage();

  const game = useGame();
  const dispatchGame = useDispatchGame();

  const trpcJoinLobbyMutation = trpc.lobby.join.useMutation({
    onError(err) {
      showError(err.message);
    },
    onSuccess(data, variables, context) {
      const { game } = data;

      dispatchGame({
        type: "LOAD",
        payload: {
          game: {
            id: game.id,
            moves: game.moves,
            players: game.players,
            time: {
              start: game.time.start,
              initial: {
                remaining: game.time.initial.remaining && {
                  w: game.time.initial.remaining.w,
                  b: game.time.initial.remaining.b,
                },
              },
            },
            live: {
              FEN: game.FEN,
              time: {
                now: game.time.now,
                remaining: game.time.remaining,
              },
            },
          },
          config: {
            conclusion: {
              maintain: false,
            },
          },
        },
      });
    },
  });
  const trpcQueryLobbyMutation = trpc.lobby.query.id.useQuery(
    { lobbyID: searchParams.get("challenge") as string },
    {
      enabled: !!searchParams.get("challenge"),
      onError(err) {
        showError(err.message);
      },
      onSuccess(data) {
        console.log(data);

        if (data.lobby)
          setTarget({
            exists: true,
            config: {
              color: data.lobby.config.color,
              time: data.lobby.config.time,
            },
            id: data.lobby.id,
          });
        else
          setTarget({
            exists: false,
            config: undefined,
            id: undefined,
          });
      },
    },
  );

  function LoadingElement({ message }: { message: string }) {
    return (
      <div className="flex w-full flex-col justify-center font-semibold">
        {message}
        <div className="w-full">
          <SyncLoader customTailwind="bg-stone-600" />
        </div>
      </div>
    );
  }

  /**
   * Target lobby to join.
   */
  const [target, setTarget] = useState<
    | {
        exists: true;
        id: string;
        config: Pick<LobbyConfig, "time" | "color">;
      }
    | {
        exists: false;
        id: undefined;
        config: undefined;
      }
  >();

  //TODO: add actual UI here
  // - once friends are added, option to invite friends appears here.
  return (
    <Panel subtitle="Accept challenge?" goBackTo="/play">
      {!!game.game ? (
        <LoadingElement message="redirecting to your game..." />
      ) : trpcQueryLobbyMutation.isFetching ? (
        <LoadingElement message="loading challenge details..." />
      ) : (
        <div className="flex w-full flex-col items-center">
          {target && target.exists ? (
            <div className="flex w-full flex-col gap-2">
              <LobbyConfigurationInterface
                interactable={false}
                state={{
                  color: {
                    selection: !target.config.color
                      ? "random"
                      : target.config.color.preference === "w"
                        ? "b"
                        : "w",
                  },
                  timing: {
                    preference: {
                      selection: target.config.time ? "timed" : "non-timed",
                    },
                    option: {
                      selection: target.config.time?.template,
                    },
                  },
                }}
              />
              <AsyncButton
                isLoading={trpcJoinLobbyMutation.isLoading}
                onLoading={<SyncLoader customTailwind={"bg-green-700"} />}
                onClick={() => {
                  trpcJoinLobbyMutation.mutate({ lobbyID: target.id });
                }}
                className="hover:bg-green rounded bg-green-600 p-2"
              >
                Accept challenge!
              </AsyncButton>
            </div>
          ) : (
            <div className="flex flex-col rounded  px-3 py-1">
              <div className="flex flex-col rounded px-2 py-1">
                <span className="text-xl font-bold">Oops!</span>
                <span className="text-lg">
                  that doesn't seem to be a valid challenge
                </span>
              </div>
              <span>ask your friend to create another</span>
              or
            </div>
          )}
          <button
            className="w-fit px-1 py-1 text-sm underline"
            onClick={() => {
              router.push("/play#challenge");
            }}
          >
            Create your own
          </button>
        </div>
      )}
    </Panel>
  );
}
