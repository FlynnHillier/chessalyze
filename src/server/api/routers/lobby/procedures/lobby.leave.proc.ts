import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { LobbyMaster } from "~/lib/game/LobbyMaster";

export const trpcLobbyLeaveProcedure = LOBBYPROCEDURE.mutation(({ ctx }) => {
  const { id: pid } = ctx.user;

  const lobby = LobbyMaster.instance().getByPlayer(pid);

  if (lobby === null) {
    return;
  }

  lobby.end();

  return;
});
