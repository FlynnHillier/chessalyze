"use client";

import React from "react";
import { useState, ReactNode, cloneElement } from "react";
import {
  useMutatePanelErrorMessage,
  useReadPanelErrorMessage,
} from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/error.provider";

type JSXElementWithChildren = {
  children?: ReactNode;
};

export default function Panel<
  T extends { [key: string]: React.ReactElement<JSXElementWithChildren> },
  K extends keyof T,
>({
  children,
  subtitle,
  content,
}: {
  subtitle?: string;
  content?: {
    default?: K;
    elements: T;
  };
  children?: ReactNode;
}) {
  const [selection, setSelection] = useState<K | undefined>(content?.default);
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

        {content &&
          Object.keys(content.elements).filter((k) => k !== "common").length >
            0 && (
            <div className="flex w-full flex-row justify-start bg-inherit">
              {Object.entries(content.elements).map(([_option, element]) => {
                const option = _option as K;
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

          {content &&
            selection &&
            React.cloneElement(content.elements[selection], {}, children)}

          {(!content || Object.keys(content.elements).length === 0) && children}
        </div>
      </div>
    </div>
  );
}
