"use client";

import { SetStateAction, useState, Dispatch } from "react";

interface customTailwind {
  selected?: string;
  nonSelected?: string;
  all?: string;
}

/**
 * A button which allows for a single selection of multiple options.
 *
 * Generic type O, defines available options. undefined option means no selection has been made.
 */
export default function MultiButton<O extends string | undefined>({
  options,
  selected,
  onSelection,
  customTailwind,
  disabled,
}: {
  options: { [key in NonNullable<O>]: string };
  selected: O;
  onSelection: Dispatch<SetStateAction<O>> | ((selected: O) => any);
  customTailwind?: {
    enabled?: customTailwind;
    disabled?: customTailwind;
    anyAbled?: customTailwind;
    container?: string;
  };
  disabled?: boolean;
}) {
  return (
    <div className={`flex h-fit w-full flex-row ${customTailwind?.container}`}>
      {Object.keys(options).map((option) => {
        const text = options[option as NonNullable<O>];
        const isSelected = option === selected;

        return (
          <button
            disabled={disabled}
            key={option}
            className={`
              w-full  ${!disabled ? "hover:cursor-pointer" : ""} 
              ${customTailwind?.anyAbled?.all} ${isSelected ? customTailwind?.anyAbled?.selected : customTailwind?.anyAbled?.nonSelected}
              ${!disabled ? `${customTailwind?.enabled?.all} ${isSelected ? customTailwind?.enabled?.selected : customTailwind?.enabled?.nonSelected}` : ""}
              ${disabled ? `${customTailwind?.disabled?.all} ${isSelected ? customTailwind?.disabled?.selected : customTailwind?.disabled?.nonSelected}` : ""}
              `}
            onClick={() => {
              if (selected !== option) onSelection(option as O);
            }}
          >
            {text}
          </button>
        );
      })}
    </div>
  );
}
