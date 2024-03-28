import { GameInstanceManager } from "~/lib/game/GameInstanceManager";
import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { trpcGameIsNotPresentMiddleware } from "~/server/api/routers/game/middleware/game.isNotPresent.mw";
import { trpcLobbyIsNotPresentMiddleware } from "~/server/api/routers/lobby/middleware/lobby.isNotPresent.mw";

export const trpcLobbyCreateProcedure = LOBBYPROCEDURE.use(
  trpcLobbyIsNotPresentMiddleware,
)
  .use(trpcGameIsNotPresentMiddleware)
  .mutation(({ ctx }) => {
    const { id } = ctx.user;

    const lobby = GameInstanceManager.createLobby({
      pid: id,
    });

    return {
      lobby: {
        id: lobby.id,
      },
    };
  });
