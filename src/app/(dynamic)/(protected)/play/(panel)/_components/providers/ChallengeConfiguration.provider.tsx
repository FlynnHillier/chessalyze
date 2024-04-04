"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  Dispatch,
} from "react";
import { ReducerAction } from "~/types/util/context.types";

import { GameTimePreset, Color } from "~/types/game.types";
import { useLobby } from "~/app/_components/providers/lobby.provider";

type ChallengeConfiguration = {
  time: {
    preference: "timed" | "non-timed";
    preset?: GameTimePreset;
  };
  color: {
    preference: "random" | Color;
  };
};

const defaultChallengeConfiguration: ChallengeConfiguration = {
  time: {
    preference: "timed",
    preset: "10m",
  },
  color: {
    preference: "random",
  },
};

const ChallengeConfigurationContext = createContext<{
  challengeConfiguration: ChallengeConfiguration;
  dispatchChallengeConfiguration: Dispatch<ChallengeConfigurationReducerAction>;
}>({
  challengeConfiguration: defaultChallengeConfiguration,
  dispatchChallengeConfiguration: () => {},
});

type ChallengeConfigurationReducerAction =
  | ReducerAction<
      "TIME_PREFERENCE",
      {
        time: {
          preference: ChallengeConfiguration["time"]["preference"];
        };
      }
    >
  | ReducerAction<
      "TIME_OPTION",
      {
        time: {
          preset: ChallengeConfiguration["time"]["preset"];
        };
      }
    >
  | ReducerAction<
      "COLOR",
      {
        color: {
          preference: ChallengeConfiguration["color"]["preference"];
        };
      }
    >;

function reducer(
  state: ChallengeConfiguration,
  action: ChallengeConfigurationReducerAction,
): ChallengeConfiguration {
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

    case "COLOR": {
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
 * Access local challenge configuration context from components within the challenge configuration provider
 */
export function useChallengeConfiguration() {
  return useContext(ChallengeConfigurationContext);
}

/**
 * Provide context regarding current non-staged challenge configuration to all child components
 */
export function ChallengeConfigurationContextProvider() {
  const [challengeConfiguration, dispatchChallengeConfiguration] = useReducer(
    reducer,
    defaultChallengeConfiguration,
  );
  const { lobby } = useLobby();

  /**
   * Sync active lobby context configuration to challenge configuration
   */
  useEffect(() => {
    if (lobby.lobby?.config.time)
      dispatchChallengeConfiguration({
        type: "TIME_OPTION",
        payload: {
          time: {
            preset: lobby.lobby.config.time.preset,
          },
        },
      });
    else
      dispatchChallengeConfiguration({
        type: "TIME_PREFERENCE",
        payload: {
          time: {
            preference: challengeConfiguration.time.preference ?? "non-timed",
          },
        },
      });
  }, [lobby.lobby?.config.time?.preset, lobby.lobby?.config.time?.verbose]);

  /**
   * Sync active lobby context configuration to challenge configuration
   */
  useEffect(() => {
    dispatchChallengeConfiguration({
      type: "COLOR",
      payload: {
        color: {
          preference:
            lobby.lobby?.config.color?.preference ??
            challengeConfiguration.color.preference ??
            "random",
        },
      },
    });
  }, [lobby.lobby?.config.color?.preference]);

  return (
    <ChallengeConfigurationContext.Provider
      value={{
        challengeConfiguration,
        dispatchChallengeConfiguration,
      }}
    ></ChallengeConfigurationContext.Provider>
  );
}
