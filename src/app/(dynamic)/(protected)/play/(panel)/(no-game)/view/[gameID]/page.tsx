import DispatchServerGameContext from "~/app/_components/providers/client/dispatchers/DispatchServerGameContext";
import Panel from "../../../_components/Panel";
import TraverseGameMovements from "../../../_components/interfaces/TraverseGameMovements";
import { redirect } from "next/navigation";
import { getGameSummary } from "~/lib/drizzle/transactions/game.drizzle";

export default async function ViewRetrospectiveGamePage({
  params,
}: {
  params: { gameID: string };
}) {
  const GAME = await getGameSummary(params.gameID);

  if (!GAME) return redirect("/play/view");

  return (
    <DispatchServerGameContext
      serverGame={{
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
