import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { LobbyMaster } from "~/lib/game/LobbyMaster";

export const trpcLobbyStatusProcedure = LOBBYPROCEDURE.query(({ ctx }) => {
  const { id: pid } = ctx.user;

  const lobby = LobbyMaster.instance().getByPlayer(pid);

  if (!lobby)
    return {
      present: false,
    };

  return {
    present: true,
    lobby: {
      id: lobby.id,
    },
  };
});
