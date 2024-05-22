//Include chessBoard and activity panel
import { ReactNode } from "react";

import ChessInterface from "~/app/(dynamic)/(protected)/play/_components/ChessInterface";

/**
 * Layout of /play/** routes
 *
 */
export default function PlayLayout({ children }: { children: ReactNode }) {
  return (
    <div className="box-border flex h-full max-h-full flex-col items-center gap-10 lg:flex-row lg:items-start lg:justify-center lg:gap-8">
      <div className="h-fit w-5/6 max-w-2xl lg:w-2/5">
        {/* TODO: add some loading spinnner while component loads */}
        <ChessInterface />
      </div>
      <div className="h-full w-full lg:w-fit">{children}</div>
    </div>
  );
}
