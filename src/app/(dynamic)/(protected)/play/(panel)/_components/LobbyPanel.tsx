"use client";

import { useCallback, useEffect, useState, useReducer } from "react";
import { IoIosLink } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { FaRegCopy, FaChessKing } from "react-icons/fa";
import { FaChess, FaRegChessKing } from "react-icons/fa6";

import { trpc } from "~/app/_trpc/client";
import { useLobby } from "~/app/_components/providers/lobby.provider";
import AsyncButton from "~/app/_components/common/AsyncButton";
import SyncLoader from "~/app/_components/loading/SyncLoader";
import MultiButton from "~/app/_components/common/MultiButton";
import { TRPCClientError } from "@trpc/client";

import { GameTimePreset, Color } from "~/types/game.types";

import { ReducerAction } from "~/types/util/context.types";
import LobbyConfigurationInterface from "~/app/(dynamic)/(protected)/play/(panel)/_components/LobbyConfiguration";

type TimingPreference = "timed" | "non-timed";

type LocalConfig = {
  time: {
    preference: "timed" | "non-timed";
    preset?: GameTimePreset;
  };
  color: {
    preference: "random" | Color;
  };
};

type RDCRActnLobbyConfig =
  | ReducerAction<
      "TIME_PREFERENCE",
      {
        time: {
          preference: LocalConfig["time"]["preference"];
        };
      }
    >
  | ReducerAction<
      "TIME_OPTION",
      {
        time: {
          preset: LocalConfig["time"]["preset"];
        };
      }
    >
  | ReducerAction<
      "COLOR_OPTION",
      {
        color: {
          preference: LocalConfig["color"]["preference"];
        };
      }
    >;

/**
 * Redcucer used to interface mutations made to local lobby configuration
 */
function localConfigReducer(
  state: LocalConfig,
  action: RDCRActnLobbyConfig,
): LocalConfig {
  switch (action.type) {
    case "TIME_PREFERENCE": {
      const { time } = action.payload;

      return {
        ...state,
        time: {
          preference: time.preference,
          preset: state.time.preset,
        },
      };
    }
    case "TIME_OPTION": {
      const { time } = action.payload;

      return {
        ...state,
        time: {
          preference: "timed",
          preset: time.preset,
        },
      };
    }

    case "COLOR_OPTION": {
      const { color } = action.payload;

      return {
        ...state,
        color: {
          preference: color.preference,
        },
      };
    }

    default:
      return { ...state };
  }
}

/**
 * Interface to configure and create a lobby
 */
export function LobbyPanel() {
  const { lobby, dispatchLobby } = useLobby();
  const createLobbyMutation = trpc.lobby.create.useMutation();
  const leaveLobbyMutation = trpc.lobby.leave.useMutation();

  const [localConfig, dispatchLocalConfig] = useReducer(localConfigReducer, {
    time: { preference: "timed", preset: "10m" },
    color: {
      preference: "random",
    },
  });

  const [disableConfigurationChanges, setDisabledConfigurationChanges] =
    useState<boolean>(false);

  const [hasCopiedChallengeLink, setHasCopiedChallengeLink] =
    useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  /**
   * Sync context time config to local config
   */
  useEffect(() => {
    if (lobby.lobby?.config.time)
      dispatchLocalConfig({
        type: "TIME_OPTION",
        payload: {
          time: {
            preset: lobby.lobby.config.time.preset,
          },
        },
      });
    else
      dispatchLocalConfig({
        type: "TIME_PREFERENCE",
        payload: {
          time: {
            preference: localConfig.time.preference ?? "non-timed",
          },
        },
      });
  }, [lobby.lobby?.config.time?.preset, lobby.lobby?.config.time?.verbose]);

  /**
   * sync context color config to local config
   */
  useEffect(() => {
    dispatchLocalConfig({
      type: "COLOR_OPTION",
      payload: {
        color: {
          preference:
            lobby.lobby?.config.color?.preference ??
            localConfig.color.preference ??
            "random",
        },
      },
    });
  }, [lobby.lobby?.config.color?.preference]);

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
   * Show an error in the panel
   */
  const showError = useCallback(
    (errorMessage: string) => {
      setErrorMessage(errorMessage);
    },
    [setErrorMessage],
  );

  /**
   * Hide any present error message
   */
  const hideError = useCallback(() => {
    if (errorMessage) setErrorMessage(undefined);
  }, [setErrorMessage]);

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
        (localConfig.time.preference === "timed" && !localConfig.time.preset) ||
        !localConfig.color.preference
      )
        return showError("Please choose atleast one option for all options!");

      const r = await createLobbyMutation.mutateAsync({
        config: {
          time:
            localConfig.time.preference === "timed"
              ? {
                  preset: localConfig.time.preset,
                }
              : undefined,
          color:
            localConfig.color.preference === "random"
              ? undefined
              : {
                  preference: localConfig.color.preference,
                },
        },
      });
      dispatchLobby({
        type: "START",
        payload: {
          lobby: {
            id: r.lobby.id,
            config: {
              time: r.lobby.config.time
                ? {
                    verbose: r.lobby.config.time.verbose,
                    preset: r.lobby.config.time.preset,
                  }
                : undefined,
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
    <div
      className="flex h-fit w-full flex-col gap-2 p-2 font-semibold text-gray-100"
      onClick={() => {
        hideError();
      }}
    >
      {/* 
        Error message display 
      */}
      {errorMessage && (
        <div className="flex w-full justify-center rounded bg-red-800 p-2 text-center text-white">
          {errorMessage}
        </div>
      )}

      <LobbyConfigurationInterface
        disabled={disableConfigurationChanges}
        interactable={true}
        state={{
          color: {
            selection: localConfig.color.preference,
            onSelection: (selection) => {
              dispatchLocalConfig({
                type: "COLOR_OPTION",
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
              selection: localConfig.time.preference,
              onSelection: (selection) => {
                dispatchLocalConfig({
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
              selection: localConfig.time.preset,
              onSelection: (selection) => {
                dispatchLocalConfig({
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
          (localConfig.time.preference === "timed" &&
            !localConfig.time.preset) ||
          !localConfig.color.preference
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