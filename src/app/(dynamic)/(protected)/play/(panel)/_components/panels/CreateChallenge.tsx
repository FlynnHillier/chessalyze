"use client";

import { useEffect, useState } from "react";
import { IoIosLink } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa";

import { trpc } from "~/app/_trpc/client";
import { useLobby } from "~/app/_components/providers/lobby.provider";
import AsyncButton from "~/app/_components/common/AsyncButton";
import SyncLoader from "~/app/_components/loading/SyncLoader";
import { TRPCClientError } from "@trpc/client";

import { useChallengeConfiguration } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/ChallengeConfiguration.provider";
import { useMutatePanelErrorMessage } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/error.provider";

import LobbyConfigurationInterface from "~/app/(dynamic)/(protected)/play/(panel)/_components/LobbyConfiguration";

/**
 * Interface to configure and create a lobby
 */
export function CreateChallenge() {
  const { lobby, dispatchLobby } = useLobby();
  const createLobbyMutation = trpc.lobby.create.useMutation();
  const leaveLobbyMutation = trpc.lobby.leave.useMutation();
  const { show: showError } = useMutatePanelErrorMessage();

  const [disableConfigurationChanges, setDisabledConfigurationChanges] =
    useState<boolean>(false);

  const [hasCopiedChallengeLink, setHasCopiedChallengeLink] =
    useState<boolean>(false);

  const { challengeConfiguration, dispatchChallengeConfiguration } =
    useChallengeConfiguration();

  /**
   * Disallow further changes to lobby configuration
   *
   */
  useEffect(() => {
    setDisabledConfigurationChanges(
      lobby.present || createLobbyMutation.isLoading,
    );
  }, [lobby.present, createLobbyMutation.isLoading]);

  /**
   * If user has copied *current* challenge link
   *
   */
  useEffect(() => {
    setHasCopiedChallengeLink(false);
  }, [lobby.present]);

  /**
   * Cancel players current lobby
   */
  async function cancelLobby() {
    if (!lobby.present) return;

    try {
      const r = await leaveLobbyMutation.mutateAsync();
      dispatchLobby({
        type: "END",
        payload: {},
      });
    } catch (e) {
      if (e instanceof TRPCClientError) {
        showError(e.message);
      }
      showError("something went wrong");
    }
  }

  /**
   * Generate a new lobby for the player with configuration options passed
   *
   */
  async function generateLobby() {
    try {
      if (
        (challengeConfiguration.time.preference === "timed" &&
          !challengeConfiguration.time.preset) ||
        !challengeConfiguration.color.preference
      )
        return showError("Please choose atleast one option for all options!");

      const r = await createLobbyMutation.mutateAsync({
        config: {
          time:
            challengeConfiguration.time.preference === "timed"
              ? {
                  preset: challengeConfiguration.time.preset,
                }
              : undefined,
          color:
            challengeConfiguration.color.preference === "random"
              ? undefined
              : {
                  preference: challengeConfiguration.color.preference,
                },
        },
      });
      dispatchLobby({
        type: "START",
        payload: {
          lobby: {
            id: r.lobby.id,
            config: {
              time:
                r.lobby.config.time &&
                ((r.lobby.config.time.preset && {
                  template: r.lobby.config.time.preset,
                }) ||
                  (r.lobby.config.time.verbose && {
                    absolute: r.lobby.config.time.verbose,
                  })),
            },
          },
        },
      });
    } catch (e) {
      if (e instanceof TRPCClientError) {
        showError(e.message);
      } else {
        showError("something went wrong");
      }
    }
  }

  /**
   * Generate and copy a link that will join other users to the users created lobby
   *
   */
  function copyChallengeLink() {
    if (lobby.lobby?.id)
      navigator.clipboard.writeText(
        `${window.location.origin}/play/join?challenge=${lobby.lobby.id}`,
      );
    setHasCopiedChallengeLink(true);
  }

  return (
    <div className="flex h-fit w-full flex-col gap-2 text-gray-100">
      <LobbyConfigurationInterface
        disabled={disableConfigurationChanges}
        interactable={true}
        state={{
          color: {
            selection: challengeConfiguration.color.preference,
            onSelection: (selection) => {
              dispatchChallengeConfiguration({
                type: "COLOR",
                payload: {
                  color: {
                    preference: selection,
                  },
                },
              });
            },
          },
          timing: {
            preference: {
              selection: challengeConfiguration.time.preference,
              onSelection: (selection) => {
                dispatchChallengeConfiguration({
                  type: "TIME_PREFERENCE",
                  payload: {
                    time: {
                      preference: selection,
                    },
                  },
                });
              },
            },
            option: {
              selection: challengeConfiguration.time.preset,
              onSelection: (selection) => {
                dispatchChallengeConfiguration({
                  type: "TIME_OPTION",
                  payload: {
                    time: {
                      preset: selection,
                    },
                  },
                });
              },
            },
          },
        }}
      />

      {/* 
        Create a lobby
      */}
      <AsyncButton
        isLoading={createLobbyMutation.isLoading}
        onLoading={<SyncLoader customTailwind="bg-stone-700" />}
        onClick={generateLobby}
        customTailwind={{
          enabled: "hover:bg-stone-600 bg-stone-700",
          disabled: "bg-stone-800  text-stone-500",
        }}
        disabled={
          lobby.present ||
          (challengeConfiguration.time.preference === "timed" &&
            !challengeConfiguration.time.preset) ||
          !challengeConfiguration.color.preference
        }
        className="roundedpx-3 flex h-full w-full flex-row items-center justify-center gap-1 text-wrap rounded py-2 text-lg font-semibold text-white"
      >
        <IoIosLink />
        generate challenge link
      </AsyncButton>

      {/* 
        Show only when lobby has been created
      */}
      {lobby.present && (
        <>
          {!leaveLobbyMutation.isLoading && (
            <div className="flex w-full flex-col justify-center text-center">
              <div className="flex w-full flex-row justify-center">
                {/* 
                  Copy challenge link to share
                */}
                <div
                  className="flex w-fit items-center justify-center gap-1 rounded px-2 py-2 hover:cursor-pointer"
                  onClick={copyChallengeLink}
                >
                  {!hasCopiedChallengeLink ? (
                    <>
                      <FaRegCopy />
                      <div>copy challenge link</div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <div>waiting for opponent to accept</div>
                      <div className="flex flex-row items-center justify-center gap-0.5 text-xs">
                        <FaRegCopy />
                        re-copy challenge link
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {hasCopiedChallengeLink && (
                <SyncLoader customTailwind="bg-stone-600" />
              )}
            </div>
          )}

          {/* 
            Cancel lobby
          */}
          <AsyncButton
            isLoading={leaveLobbyMutation.isLoading}
            onLoading={
              <div className="flex w-full flex-col justify-center font-semibold">
                {"cancelling challenge..."}
                <div className="w-full">
                  <SyncLoader customTailwind="bg-stone-600" />
                </div>
              </div>
            }
            onClick={cancelLobby}
            disabled={!lobby.present}
            className="flex w-full flex-row items-center justify-center gap-1 text-sm"
          >
            <MdCancel />
            Cancel challenge link
          </AsyncButton>
        </>
      )}
    </div>
  );
}
