"use client";

import { useState } from "react";
import {
  useMutatePanelErrorMessage,
  useReadPanelErrorMessage,
} from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/error.provider";

export default function Panel<
  T extends { [key: string]: JSX.Element } & { common: JSX.Element },
  K extends Exclude<keyof T, "common">,
>({
  subtitle,
  content,
  defaultContent,
}: {
  subtitle?: string;
  content: T;
  defaultContent?: K;
}) {
  const [selection, setSelection] = useState<K | undefined>(defaultContent);
  const error = useReadPanelErrorMessage();
  const { hide } = useMutatePanelErrorMessage();

  return (
    <div
      className="container h-fit w-full min-w-96 overflow-hidden rounded bg-stone-800 pt-2 text-center"
      onClick={() => {
        if (error) hide();
      }}
    >
      <div className="flex flex-col">
        <div className="text-gra text-green w-full pb-2 text-3xl font-bold">
          <h1>Play chess!</h1>
        </div>
        {subtitle && (
          <div className="h-fit w-full bg-stone-800 pb-3">
            <span className="text-nowrap text-lg font-bold">{subtitle}</span>
          </div>
        )}

        {Object.keys(content).filter((k) => k !== "common").length > 0 && (
          <div className="flex w-full flex-row justify-start bg-inherit">
            {Object.entries(content)
              .filter(([k, _]) => k !== "common")
              .map(([_option, element]) => {
                const option = _option as Exclude<K, "common">;
                const isSelected = option === selection;

                return (
                  <div
                    className={`px-1 py-1.5 text-xl hover:cursor-pointer ${isSelected ? "bg-stone-900" : "hover:bg-stone-950"} w-full`}
                    onClick={() => {
                      setSelection(option);
                    }}
                  >
                    {option as string}
                  </div>
                );
              })}
          </div>
        )}

        <div className="flex flex-col gap-2 bg-stone-900 p-3 text-center font-semibold">
          {error && (
            <div className="w-full text-wrap rounded bg-red-800 p-2 text-center">
              {error}
            </div>
          )}

          {selection && content[selection]}
          {content["common"]}
        </div>
      </div>
    </div>
  );
}
