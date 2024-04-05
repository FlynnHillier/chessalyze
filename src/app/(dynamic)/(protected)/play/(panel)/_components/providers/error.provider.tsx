"use client";

import { useContext, createContext, useState, ReactNode } from "react";
import { useTimeout } from "usehooks-ts";

const PanelErrorMessageContext = createContext<{
  text: string | null;
  show: (error: string, autoHide?: boolean) => any;
  hide: () => any;
}>({
  text: null,
  hide: () => {},
  show: () => {},
});

/**
 * Access panel error message
 */
export function useReadPanelErrorMessage(): string | null {
  const { text } = useContext(PanelErrorMessageContext);

  return text;
}

/**
 * Mutate panel error message
 *
 */
export function useMutatePanelErrorMessage() {
  const { show, hide } = useContext(PanelErrorMessageContext);

  return { show, hide };
}

/**
 * Provide access to panel error message in any child component
 *
 */
export function PanelErrorMessageContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [error, setError] = useState<string | null>(null);
  const [clearErrorTimeout, setClearErrorTimeout] = useState<number | null>(
    null,
  );

  /**
   * Automatically clear error message after a short delay
   */
  useTimeout(() => {
    setError(null);
  }, clearErrorTimeout);

  return (
    <PanelErrorMessageContext.Provider
      value={{
        text: error,
        show: (error: string, autoHide: boolean = true) => {
          if (autoHide) setClearErrorTimeout(10000);

          setError(error);
        },
        hide: () => {
          setClearErrorTimeout(null);
          setError(null);
        },
      }}
    >
      {children}
    </PanelErrorMessageContext.Provider>
  );
}
