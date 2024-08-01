"use client";

import { useEffect, useState, useRef } from "react";
import { IoIosLink } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa";

import { trpc } from "~/app/_trpc/client";
import { useLobby } from "~/app/_components/providers/client/lobby.provider";
import AsyncButton from "~/app/_components/common/buttons/AsyncButton";
import SyncLoader from "~/app/_components/loading/SyncLoader";

import { useChallengeConfiguration } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/ChallengeConfiguration.provider";
import { useMutatePanelErrorMessage } from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/error.provider";

import LobbyConfigurationInterface from "~/app/(dynamic)/(protected)/play/(panel)/_components/LobbyConfiguration";

/**
 * Interface to configure and create a lobby
 */
export function CreateChallenge() {
  const { lobby, dispatchLobby } = useLobby();

  const requestAllowPublicChallengeLinkMutation =
    trpc.lobby.configure.link.enable.useMutation({
      onError(error, variables, context) {
        showError(error.message);
      },
      onSuccess(data) {
        dispatchLobby({
          type: "UPDATE",
          payload: data,
        });
      },
    });
  const requestDisallowPublicChallengeLinkMutation =
    trpc.lobby.configure.link.disable.useMutation({
      onError(error) {
        showError(error.message);
      },
      onSuccess(data) {
        if (data.lobbyHasEnded)
          dispatchLobby({
            type: "END",
            payload: {},
          });
        else if (data.snapshot) {
          dispatchLobby({
            type: "UPDATE",
            payload: data.snapshot,
          });
        }
      },
    });

  const { show: showError } = useMutatePanelErrorMessage();

  const elementBottomRef = useRef<HTMLSpanElement>(null);

  const [disableConfigurationChanges, setDisabledConfigurationChanges] =
    useState<boolean>(false);

  const [hasCopiedChallengeLink, setHasCopiedChallengeLink] =
    useState<boolean>(false);

  const { challengeConfiguration, dispatchChallengeConfiguration } =
    useChallengeConfiguration();

  /**
   * For vertical view, scroll bottom of element into view if element height changes due to challenge creation / link copy
   *
   */
  useEffect(() => {
    elementBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [hasCopiedChallengeLink, lobby.present]);

  /**
   * Disallow further changes to lobby configuration
   *
   */
  useEffect(() => {
    setDisabledConfigurationChanges(
      lobby.present || requestAllowPublicChallengeLinkMutation.isLoading,
    );
  }, [lobby.present, requestAllowPublicChallengeLinkMutation.isLoading]);

  /**
   * If user has copied *current* challenge link
   *
   */
  useEffect(() => {
    setHasCopiedChallengeLink(false);
  }, [lobby.present]);

  function isLobbyConfigurationInvalid() {
    return (
      (challengeConfiguration.time.preference === "timed" &&
        !challengeConfiguration.time.preset) ||
      !challengeConfiguration.color.preference
    );
  }

  /**
   * Generate and copy a link that will join other users to the users created lobby
   *
   */
  function copyChallengeLinkToClipboard() {
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

      <AsyncButton
        isLoading={requestAllowPublicChallengeLinkMutation.isLoading}
        onLoading={<SyncLoader customTailwind="bg-stone-700" />}
        onClick={() => {
          if (isLobbyConfigurationInvalid())
            showError("Please choose atleast one option for all options!");
          else
            requestAllowPublicChallengeLinkMutation.mutate({
              color:
                challengeConfiguration.color.preference === "random"
                  ? undefined
                  : challengeConfiguration.color.preference,
              time:
                challengeConfiguration.time.preference === "non-timed" ||
                !challengeConfiguration.time.preset
                  ? undefined
                  : {
                      template: challengeConfiguration.time.preset,
                    },
            });
        }}
        customTailwind={{
          enabled: "hover:bg-stone-600 bg-stone-700",
          disabled: "bg-stone-800  text-stone-500",
        }}
        disabled={
          !!lobby.lobby ||
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
        Show only when lobby link is set to public
      */}
      {lobby.lobby && lobby.lobby.accessibility.isPublicLinkAllowed && (
        <>
          {!requestDisallowPublicChallengeLinkMutation.isLoading && (
            <div className="flex w-full flex-col justify-center text-center">
              <div className="flex w-full flex-row justify-center">
                {/* 
                  Copy challenge link to share
                */}
                <div
                  className="flex w-fit items-center justify-center gap-1 rounded px-2 py-2 hover:cursor-pointer"
                  onClick={copyChallengeLinkToClipboard}
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
            isLoading={requestDisallowPublicChallengeLinkMutation.isLoading}
            onLoading={
              <div className="flex w-full flex-col justify-center font-semibold">
                {"cancelling challenge..."}
                <div className="w-full">
                  <SyncLoader customTailwind="bg-stone-600" />
                </div>
              </div>
            }
            onClick={() => {
              if (lobby.lobby?.accessibility.isPublicLinkAllowed)
                requestDisallowPublicChallengeLinkMutation.mutate();
            }}
            disabled={!lobby.present}
            className="flex w-full flex-row items-center justify-center gap-1 text-sm"
          >
            <MdCancel />
            Cancel challenge link
          </AsyncButton>
        </>
      )}
      <span ref={elementBottomRef} />
    </div>
  );
}
