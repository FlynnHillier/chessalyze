"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { useTimeout } from "usehooks-ts";
import { RxCross2 } from "react-icons/rx";
import { ClassNameValue } from "tailwind-merge";
import { cn } from "~/lib/util/cn";

type ContextType = {
  showGlobalError: (message: string, autoHideAfter?: false | number) => any;
  hideGlobalError: (matchMessage?: string) => any;
};

const GLOBAL_ERROR_CONTEXT = createContext<ContextType>({
  showGlobalError: () => {},
  hideGlobalError: () => {},
});

export function useGlobalError() {
  return useContext(GLOBAL_ERROR_CONTEXT);
}

export function GlobalErrorProvider({
  children,
  className,
}: {
  children: ReactNode;
  className: ClassNameValue;
}) {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [hideErrorMessageTimeoutMS, setHideErrorMessageTimeoutMS] = useState<
    number | null
  >(null);

  useTimeout(() => {
    hideGlobalError();
  }, hideErrorMessageTimeoutMS);

  const hideGlobalError = useCallback(
    (matchMessage?: string) => {
      if (!matchMessage || (matchMessage && matchMessage === errorMessage)) {
        setErrorMessage(undefined);
      }
      setHideErrorMessageTimeoutMS(null);
    },
    [setErrorMessage, setHideErrorMessageTimeoutMS],
  );

  const showGlobalError = useCallback(
    (message: string, autoHideAfter?: false | number) => {
      if (autoHideAfter !== false)
        setHideErrorMessageTimeoutMS(autoHideAfter ?? 10000);
      setErrorMessage(message);
    },
    [setErrorMessage, setHideErrorMessageTimeoutMS],
  );

  return (
    <GLOBAL_ERROR_CONTEXT.Provider
      value={{
        hideGlobalError: hideGlobalError,
        showGlobalError: showGlobalError,
      }}
    >
      <div className={cn("h-full w-full", className, "relative")}>
        {errorMessage && (
          <div className="no-wrap absolute left-0 top-3 z-50 flex h-fit w-full flex-row items-center justify-center text-balance text-center font-semibold">
            <div className="flex max-w-64 flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1 overflow-hidden rounded bg-red-700 px-3 py-2">
              {errorMessage}
              <button
                onClick={() => {
                  hideGlobalError();
                }}
              >
                <RxCross2 size={18} />
              </button>
            </div>
          </div>
        )}
        {children}
      </div>
    </GLOBAL_ERROR_CONTEXT.Provider>
  );
}
