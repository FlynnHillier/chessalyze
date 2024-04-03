"use client";

import { useCallback, useEffect, useState, useReducer } from "react";
import { IoIosLink } from "react-icons/io";
import { MdCancel } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa";

import { trpc } from "~/app/_trpc/client";
import { useLobby } from "~/app/_components/providers/lobby.provider";
import AsyncButton from "~/app/_components/common/AsyncButton";
import SyncLoader from "~/app/_components/loading/SyncLoader";
import MultiButton from "~/app/_components/common/MultiButton";
import { TRPCClientError } from "@trpc/client";

import { GameTimePreset } from "~/types/game.types";

import { ReducerAction } from "~/types/util/context.types";

type TimingPreference = "timed" | "non-timed";

type LocalConfig = {
  time: {
    preference: "timed" | "non-timed";
    preset?: GameTimePreset;
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
        time: {
          preference: time.preference,
          preset: state.time.preset,
        },
      };
    }
    case "TIME_OPTION": {
      const { time } = action.payload;

      return {
        time: {
          preference: "timed",
          preset: time.preset,
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
    time: { preference: "non-timed", preset: "10m" },
  });

  const [disableConfigurationChanges, setDisabledConfigurationChanges] =
    useState<boolean>(false);

  const [hasCopiedChallengeLink, setHasCopiedChallengeLink] =
    useState<boolean>(false);

  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  /**
   * Sync context config to local config
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
            preference: "non-timed",
          },
        },
      });
  }, [lobby.lobby?.config.time?.preset, lobby.lobby?.config.time?.verbose]);

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
      if (localConfig.time.preference === "timed" && !localConfig.time.preset)
        return showError("option must be selected for game time");

      const r = await createLobbyMutation.mutateAsync({
        config: {
          time:
            localConfig.time.preference === "timed"
              ? {
                  preset: localConfig.time.preset,
                }
              : undefined,
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
      className="flex h-fit w-full flex-col gap-2 font-semibold text-gray-100"
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

      {/* 
        Select timing preference
      */}
      <MultiButton<TimingPreference>
        disabled={disableConfigurationChanges}
        options={{
          timed: "timed",
          "non-timed": "non-timed",
        }}
        onSelection={(selection: TimingPreference) => {
          dispatchLocalConfig({
            type: "TIME_PREFERENCE",
            payload: {
              time: {
                preference: selection,
              },
            },
          });
        }}
        selected={localConfig.time.preference}
        customTailwind={{
          anyAbled: {
            all: "rounded px-1 py-1.5 font-semibold",
          },
          enabled: {
            selected: "bg-green-600 hover:bg-green-700",
            nonSelected: "bg-stone-800 hover:bg-stone-950",
          },
          disabled: {
            selected: "bg-green-800 text-stone-400",
            nonSelected: "bg-stone-800 text-stone-500",
          },
          container: "gap-2 px-2 py-1 rounded",
        }}
      />

      {/* 
        Select timing option if timing preference is timed
      */}
      {localConfig.time.preference === "timed" && (
        <MultiButton<GameTimePreset | undefined>
          disabled={disableConfigurationChanges}
          options={{
            "30s": "30s",
            "1m": "1m",
            "5m": "5m",
            "10m": "10m",
            "15m": "15m",
            "30m": "30m",
            "1h": "1h",
          }}
          onSelection={(selected: GameTimePreset | undefined) => {
            dispatchLocalConfig({
              type: "TIME_OPTION",
              payload: {
                time: {
                  preset: selected,
                },
              },
            });
          }}
          selected={localConfig.time.preset}
          customTailwind={{
            anyAbled: {
              all: "rounded px-1 py-1.5 font-semibold",
            },
            enabled: {
              selected: "bg-green-600 hover:bg-green-700",
              nonSelected: "bg-stone-800 hover:bg-stone-950",
            },
            disabled: {
              selected: "bg-green-800 text-stone-400",
              nonSelected: "bg-stone-800 text-stone-500",
            },
            container: "gap-2 px-2 py-1 rounded",
          }}
        />
      )}

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
          (localConfig.time.preference === "timed" && !localConfig.time.preset)
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
