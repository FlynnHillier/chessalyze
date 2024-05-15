"use client";

import React from "react";
import { useState, ReactNode, cloneElement } from "react";
import {
  useMutatePanelErrorMessage,
  useReadPanelErrorMessage,
} from "~/app/(dynamic)/(protected)/play/(panel)/_components/providers/error.provider";

import { FaLongArrowAltLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

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
  goBackTo,
}: {
  subtitle?: string;
  content?: {
    default?: K;
    elements: T;
  };
  children?: ReactNode;
  goBackTo?: string;
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<K | undefined>(content?.default);
  const error = useReadPanelErrorMessage();
  const { hide } = useMutatePanelErrorMessage();

  return (
    <div
      className="w-full min-w-96 overflow-hidden rounded bg-stone-800 pt-2 text-center"
      onClick={() => {
        if (error) hide();
      }}
    >
      <div className="flex flex-col">
        <div className="text-gra text-green relative w-full pb-2 text-3xl font-bold">
          {goBackTo && (
            <div className="absolute left-1 top-1 h-1/2 w-1/12  overflow-hidden ">
              <div className="flex h-full w-full justify-start">
                <FaLongArrowAltLeft
                  className="h-full w-full hover:cursor-pointer hover:text-stone-500"
                  onClick={() => {
                    router.push(goBackTo);
                  }}
                />
              </div>
            </div>
          )}

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
            <div className="flex w-full flex-row justify-start bg-inherit font-bold">
              {Object.entries(content.elements).map(([_option, element]) => {
                const option = _option as K;
                const isSelected = option === selection;

                return (
                  <div
                    key={option as string}
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

        <div className="box-border flex max-h-96 flex-col items-center gap-2 overflow-y-scroll bg-stone-900  p-3 text-center font-semibold scrollbar-hide ">
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
