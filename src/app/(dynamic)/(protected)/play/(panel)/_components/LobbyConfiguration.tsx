import MultiButton from "~/app/_components/common/buttons/MultiButton";
import { GameTimePreset, Color } from "~/types/game.types";
import { FaRegChessKing } from "react-icons/fa6";
import { FaChess } from "react-icons/fa";

type TimingPreference = "timed" | "non-timed";

type ColorPreference = Color | "random";

/**
 * Allow for interaction / viewing of lobby configuration options
 *
 * @param interactable if true, component acts only as static view of configuration, with no interaction capabilities.
 * @param disabled if true, will not allow for any changes to configuration
 * @param state current configuration and callbacks for when selections are made.
 */
export default function LobbyConfigurationInterface({
  interactable,
  disabled,
  state,
}: {
  interactable: boolean;
  disabled?: boolean;
  state: {
    timing?: {
      preference?: {
        onSelection?: (selection: TimingPreference) => any;
        selection?: TimingPreference;
      };
      option?: {
        onSelection?: (selection: GameTimePreset | undefined) => any;
        selection?: GameTimePreset | undefined;
      };
    };
    color?: {
      onSelection?: (selection: Color | "random") => any;
      selection?: Color | "random";
    };
  };
}) {
  //TODO: This component is a bit messy, it would be nice to clean it up by creating some component that perhaps allows
  // for multiple MultiButtons that relate to one another and interact together based on props

  return (
    <div className="flex flex-col gap-3">
      {/*   
        Select timing preference
      */}
      <MultiButton<TimingPreference>
        disabled={interactable === false || disabled}
        options={{
          timed: {},
          "non-timed": {},
        }}
        onSelection={state.timing?.preference?.onSelection}
        selected={state.timing?.preference?.selection}
        customTailwind={{
          any: {
            any: "rounded px-1 py-1.5 font-semibold",
            isSelected: !interactable ? "bg-green-600" : "",
            nonSelected: !interactable ? "bg-stone-800 text-stone-500" : "",
          },
          ...(interactable
            ? {
                enabled: {
                  isSelected: "bg-green-600 hover:bg-green-700",
                  nonSelected: "bg-stone-800 hover:bg-stone-950",
                },
                disabled: {
                  isSelected: "bg-green-800 text-stone-400",
                  nonSelected: "bg-stone-800 text-stone-500",
                },
              }
            : {}),
          container: "gap-2 rounded",
        }}
      />
      {/* 
        Select timing option if timing preference is timed
      */}
      {state.timing?.preference?.selection === "timed" && (
        <MultiButton<GameTimePreset | undefined>
          disabled={interactable === false || disabled}
          options={{
            "30s": {},
            "1m": {},
            "5m": {},
            "10m": {},
            "15m": {},
            "30m": {},
            "1h": {},
          }}
          onSelection={state.timing.option?.onSelection}
          selected={state.timing.option?.selection}
          customTailwind={{
            any: {
              any: "rounded px-1 py-1.5 font-semibold",
              isSelected: !interactable ? "bg-green-600" : "",
              nonSelected: !interactable ? "bg-stone-800 text-stone-500" : "",
            },
            ...(interactable
              ? {
                  enabled: {
                    isSelected: "bg-green-600 hover:bg-green-700",
                    nonSelected: "bg-stone-800 hover:bg-stone-950",
                  },
                  disabled: {
                    isSelected: "bg-green-800 text-stone-400",
                    nonSelected: "bg-stone-800 text-stone-500",
                  },
                }
              : {}),
            container: "gap-2 rounded",
          }}
        />
      )}

      <MultiButton<ColorPreference>
        disabled={interactable === false || disabled}
        onSelection={state.color?.onSelection}
        selected={state.color?.selection}
        customTailwind={{
          any: {
            any: "rounded font-semibold",
          },
          disabled: {
            any: interactable ? "opacity-50" : "",
            nonSelected: interactable === false ? "opacity-50" : "",
          },
          container: "gap-2 rounded",
        }}
        options={{
          b: {
            tailwind: {
              any: {
                any: "bg-black text-white border-2",
                isSelected: "border-green-600",
                nonSelected: "border-transparent",
              },
            },
            element: (
              <div
                className={`flex h-full w-full flex-row items-center justify-center gap-1 rounded border-2 px-1 py-1.5
                ${state.color?.selection === "b" ? "border-black" : "border-transparent"}
              `}
              >
                <FaRegChessKing />
                black
              </div>
            ),
          },
          random: {
            element: (
              <div className="flex h-full w-full flex-row items-center justify-center">
                <div
                  className={`h-full w-full rounded-l border-y-2 border-l-2 bg-black text-white 
                  ${state.color?.selection === "random" ? "border-y-green-600 border-l-green-600" : "border-transparent"}`}
                >
                  <div
                    className={`flex h-full w-full flex-row items-center justify-end gap-1 rounded-l-sm border-y-2 border-l-2 py-1.5 pl-1
                    ${state.color?.selection === "random" ? "border-black" : "border-transparent"}
                  `}
                  >
                    <FaChess />
                    ran
                  </div>
                </div>
                <div
                  className={`h-full w-full rounded-r border-y-2 border-r-2 bg-white text-black 
                  ${state.color?.selection === "random" ? "border-y-green-600 border-r-green-600" : "border-transparent"}`}
                >
                  <div
                    className={`flex h-full w-full flex-row items-center justify-start gap-1 rounded-r-sm border-y-2 border-r-2 py-1.5 pr-1
                    ${state.color?.selection === "random" ? "border-black" : "border-transparent"}
                  `}
                  >
                    dom
                  </div>
                </div>
              </div>
            ),
          },
          w: {
            tailwind: {
              any: {
                any: "bg-white text-black border-2",
                isSelected: "border-green-600",
                nonSelected: "border-transparent",
              },
            },
            element: (
              <div
                className={`flex h-full w-full flex-row items-center justify-center gap-1 rounded-sm border-2 px-1 py-1.5
                  ${state.color?.selection === "w" ? "border-black" : "border-transparent"}
                `}
              >
                <FaRegChessKing />
                white
              </div>
            ),
          },
        }}
      />
    </div>
  );
}
