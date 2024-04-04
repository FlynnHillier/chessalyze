//Include chessBoard and activity panel
import { ReactNode } from "react";

import ChessInterface from "~/app/(dynamic)/(protected)/play/_components/ChessInterface";

/**
 * Layout of /play/** routes
 *
 */
export default function PlayLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-row justify-center gap-10">
      <div className="h-fit w-2/5">
        <ChessInterface />
      </div>
      <div className="h-fit w-fit overflow-hidden">{children}</div>
    </div>
  );
}
