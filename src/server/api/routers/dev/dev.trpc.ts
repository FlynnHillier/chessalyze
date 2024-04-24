import { emitDevTestEvent } from "~/lib/ws/events/dev/dev.test.ws";
import { createTRPCRouter } from "~/server/api/trpc";
import { WSRoomRegistry } from "~/lib/ws/rooms.ws";
import { devProcedure } from "~/server/api/routers/dev/dev.proc";
import z from "zod";
import { getGameSummary } from "~/lib/drizzle/transactions/game.drizzle";

export const trpcDevRouter = createTRPCRouter({
  testUserSockets: devProcedure.mutation(({ ctx }) => {
    const testRoom = WSRoomRegistry.instance().getOrCreate("testRoom");
    testRoom.join(ctx.user.id);
    emitDevTestEvent(
      { room: testRoom },
      {
        message: "dev test event",
      },
    );
    testRoom.leave(ctx.user.id);
  }),
  getGameSummary: devProcedure
    .input(
      z.object({
        gameID: z.string(),
      }),
    )
    .query(async ({ input }) => {
      return await getGameSummary(input.gameID);
    }),
});
