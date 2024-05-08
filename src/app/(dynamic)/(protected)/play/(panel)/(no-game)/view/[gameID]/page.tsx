"use server";

import DispatchServerGameContext from "~/app/_components/dispatchers/DispatchServerGameContext";
import Panel from "../../../_components/Panel";
import TraverseGameMovements from "../../../_components/interfaces/TraverseGameMovements";
import { redirect } from "next/navigation";
import { getGameSummary } from "~/lib/drizzle/transactions/game.drizzle";

/**
 * This page will load a retrospective game into game context based on the dynamic url. It will then allow the user to traverse the game but not interact / make changes to it
 *
 */
export default async function ViewRetrospectiveGamePage({
  params,
}: {
  params: { gameID: string };
}) {
  const GAME = await getGameSummary(params.gameID);

  if (!GAME) return redirect("/play/view");

  return (
    <DispatchServerGameContext
      payload={{
        id: GAME.id,
        moves: GAME.moves,
        players: GAME.players,
        time: {
          start: GAME.time.start,
        },
      }}
    >
      <Panel goBackTo="/play/view">
        <TraverseGameMovements />
      </Panel>
    </DispatchServerGameContext>
  );
}
