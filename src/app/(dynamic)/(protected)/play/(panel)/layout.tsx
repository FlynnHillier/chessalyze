import { ReactNode } from "react";

/**
 * Layout for /play** panels
 */
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <div className="container h-fit w-full min-w-96 overflow-hidden rounded bg-stone-800 pt-2 text-center">
      <div className="flex flex-col">
        <div className="text-gra text-green w-full pb-2 text-3xl font-bold">
          <h1>Play chess!</h1>
        </div>
        <div className="flex flex-col items-center gap-2 bg-stone-900 text-center font-semibold">
          {children}
        </div>
      </div>
    </div>
  );
}
