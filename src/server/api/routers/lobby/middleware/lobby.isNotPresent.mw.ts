import { TRPCError } from "@trpc/server";
import { createTRPCMiddleware } from "~/server/api/trpc";
import { LobbyMaster } from "~/lib/game/LobbyMaster";

export const trpcLobbyIsNotPresentMiddleware = createTRPCMiddleware(
  ({ ctx, next }) => {
    const existingUserLobby = LobbyMaster.instance().getByPlayer(ctx.user!.id);

    if (existingUserLobby !== null) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "User is already in lobby",
        cause: {
          lobby: {
            id: existingUserLobby.id,
          },
        },
      });
    }

    return next();
  },
);
