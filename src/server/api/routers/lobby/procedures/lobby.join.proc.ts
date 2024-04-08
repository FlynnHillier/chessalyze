import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { trpcGameIsNotPresentMiddleware } from "~/server/api/routers/game/middleware/game.isNotPresent.mw";
import { LobbyMaster } from "~/lib/game/LobbyMaster";

export const trpcLobbyJoinProcedure = LOBBYPROCEDURE.use(
  trpcGameIsNotPresentMiddleware,
)
  .input(
    z.object({
      lobby: z.object({
        id: z.string(),
      }),
    }),
  )
  .mutation(({ ctx, input }) => {
    const { id: targetID } = input.lobby;

    const lobby = LobbyMaster.instance().get(targetID);

    if (!lobby)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Target lobby was not found or is no longer available.",
      });

    const game = lobby.join({ pid: ctx.user.id,image:ctx.user.image, username:ctx.user.name });

    return {
      game: game.snapshot(),
    };
  });
