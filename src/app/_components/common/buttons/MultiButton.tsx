"use client";

type Option = Partial<{
  text: string;
  element: React.ReactNode;
  tailwind: CustomTailwind;
}>;

type CustomTailwind = Partial<{
  enabled: SelectionConditionalTailwind;
  disabled: SelectionConditionalTailwind;
  any: SelectionConditionalTailwind;
}>;

type SelectionConditionalTailwind = Partial<{
  isSelected: string;
  nonSelected: string;
  any: string;
}>;

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
  options: { [key in NonNullable<O>]: Option };
  selected?: O;
  onSelection?: (selected: O) => any;
  customTailwind?: CustomTailwind & { container?: string };
  disabled?: boolean;
}) {
  return (
    <div className={`flex h-fit w-full flex-row ${customTailwind?.container}`}>
      {Object.entries(options).map(([_key, _option]) => {
        const key = _key as NonNullable<O>;
        const { element, text, tailwind } = _option as Option;

        const isSelected = key === selected;

        return (
          <button
            disabled={disabled}
            key={key}
            className={[
              "w-full",
              !disabled !== false && "hover:cursor-pointer",
              customTailwind?.any?.any,
              customTailwind?.any?.[isSelected ? "isSelected" : "nonSelected"],
              !disabled &&
                [
                  customTailwind?.enabled?.any,
                  customTailwind?.enabled?.[
                    isSelected ? "isSelected" : "nonSelected"
                  ],
                ].join(" "),
              disabled &&
                [
                  customTailwind?.disabled?.any,
                  customTailwind?.disabled?.[
                    isSelected ? "isSelected" : "nonSelected"
                  ],
                ].join(" "),
              tailwind?.any?.any,
              tailwind &&
                tailwind.any?.[isSelected ? "isSelected" : "nonSelected"],
              !disabled &&
                [
                  tailwind?.enabled?.any,
                  tailwind?.enabled?.[
                    isSelected ? "isSelected" : "nonSelected"
                  ],
                ].join(" "),
              disabled &&
                [
                  tailwind?.disabled?.any,
                  tailwind?.disabled?.[
                    isSelected ? "isSelected" : "nonSelected"
                  ],
                ].join(" "),
            ]
              .filter((e) => !!e)
              .join(" ")}
            onClick={() => {
              if (!isSelected && onSelection) onSelection(key);
            }}
          >
            {element ?? text ?? key}
          </button>
        );
      })}
    </div>
  );
}
