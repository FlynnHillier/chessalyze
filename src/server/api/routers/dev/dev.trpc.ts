import { createTRPCRouter } from "~/server/api/trpc";
import { WSRoomRegistry } from "~/lib/ws/rooms.ws";
import { devProcedure } from "~/server/api/routers/dev/dev.proc";
import z from "zod";
import {
  getGameSummary,
  getPlayerGameSummarys,
  getRecentGameSummarys,
} from "~/lib/drizzle/transactions/game.drizzle";
import { wsServerToClientMessage } from "~/lib/ws/messages/client.messages.ws";

export const trpcDevRouter = createTRPCRouter({
  /**
   * Send a dummy socket event to any sockets registered to the user sending the request.
   */
  testUserSockets: devProcedure.mutation(({ ctx }) => {
    const testRoom = WSRoomRegistry.instance().getOrCreate("testRoom");
    testRoom.joinUser(ctx.user.id);
    wsServerToClientMessage
      .send("DEV_TEST")
      .data({ message: "dev test event" })
      .to({ room: testRoom })
      .emit();
    testRoom.leaveUser(ctx.user.id);
  }),
  getGameSummary: devProcedure
    .input(
      z.object({
        gameID: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await getGameSummary(input.gameID);
    }),
  getPlayerGameSummarys: devProcedure
    .input(
      z.object({
        playerID: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      return await getPlayerGameSummarys(input.playerID);
    }),
  getRecentGameSummarys: devProcedure.mutation(async () => {
    return await getRecentGameSummarys();
  }),
});
