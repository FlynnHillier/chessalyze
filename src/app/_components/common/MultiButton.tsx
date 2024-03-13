"use client";

import { SetStateAction, useState, Dispatch } from "react";

export default function MultiButton<O extends string>({
  options,
  selected,
  onSelection,
  customTailwind,
}: {
  options: { [key in O]: string };
  selected: O;
  onSelection: Dispatch<SetStateAction<O>>;
  customTailwind?: {
    selected?: string;
    nonSelected?: string;
    all?: string;
  };
}) {
  return (
    <div className="flex h-fit w-full flex-row gap-0.5">
      {Object.keys(options).map((option) => {
        const text = options[option as O];
        const isSelected = option === selected;

        return (
          <button
            key={option}
            className={`w-full hover:cursor-pointer ${customTailwind?.all} ${isSelected ? customTailwind?.selected : customTailwind?.nonSelected}`}
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
