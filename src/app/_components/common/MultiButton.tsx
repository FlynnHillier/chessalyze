"use client";

import { SetStateAction, useState, Dispatch } from "react";

interface customTailwind {
  selected?: string;
  nonSelected?: string;
  all?: string;
}

export default function MultiButton<O extends string>({
  options,
  selected,
  onSelection,
  customTailwind,
  disabled,
}: {
  options: { [key in O]: string };
  selected: O;
  onSelection: Dispatch<SetStateAction<O>>;
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
        const text = options[option as O];
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
