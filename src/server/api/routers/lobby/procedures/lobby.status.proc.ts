import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { GameInstanceManager } from "~/lib/game/GameInstanceManager";

export const trpcLobbyStatusProcedure = LOBBYPROCEDURE.query(({ ctx }) => {
  const { id: pid } = ctx.user;

  const existingUserLobby = GameInstanceManager.getPlayerLobby(pid);

  if (existingUserLobby === null) {
    return {
      present: false,
    };
  }

  return {
    present: true,
    lobby: {
      id: existingUserLobby.id,
    },
  };
});
