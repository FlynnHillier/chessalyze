import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { LobbyMaster } from "~/lib/game/LobbyMaster";
import { z } from "zod";

/**
 * Allows user's to query information about lobby's that do not belong to them.
 */
export const trpcLobbyQueryProcedure = LOBBYPROCEDURE.input(
  z.object({
    lobby: z.object({
      id: z.string(),
    }),
  }),
).mutation(({ input }) => {
  const { lobby: target } = input;

  const lobby = LobbyMaster.instance().get(target.id);

  if (!lobby)
    return {
      exists: false,
    };

  return {
    exists: true,
    lobby: {
      id: lobby.id,
      config: lobby.config,
    },
  };
});
