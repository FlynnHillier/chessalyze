import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { trpcGameIsNotPresentMiddleware } from "~/server/api/routers/game/middleware/game.isNotPresent.mw";
import { trpcLobbyIsNotPresentMiddleware } from "~/server/api/routers/lobby/middleware/lobby.isNotPresent.mw";
import { LobbyInstance } from "~/lib/game/LobbyInstance";
import { z } from "zod";

export const trpcLobbyCreateProcedure = LOBBYPROCEDURE.use(
  trpcLobbyIsNotPresentMiddleware,
)
  .use(trpcGameIsNotPresentMiddleware)
  .input(
    z.object({
      config: z.object({
        time: z
          .object({
            w: z.number(),
            b: z.number(),
          })
          .optional(),
      }),
    }),
  )
  .mutation(({ ctx, input }) => {
    const { id } = ctx.user;

    const lobby = new LobbyInstance(
      {
        pid: id,
      },
      {
        time: input.config.time,
      },
    );

    return {
      lobby: {
        id: lobby.id,
      },
    };
  });
