import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { trpcGameIsNotPresentMiddleware } from "~/server/api/routers/game/middleware/game.isNotPresent.mw";
import { trpcLobbyIsNotPresentMiddleware } from "~/server/api/routers/lobby/middleware/lobby.isNotPresent.mw";
import { LobbyInstance } from "~/lib/game/LobbyInstance";

export const trpcLobbyCreateProcedure = LOBBYPROCEDURE.use(
  trpcLobbyIsNotPresentMiddleware,
)
  .use(trpcGameIsNotPresentMiddleware)
  .mutation(({ ctx }) => {
    const { id } = ctx.user;

    const lobby = new LobbyInstance({
      pid: id,
    });

    return {
      lobby: {
        id: lobby.id,
      },
    };
  });
