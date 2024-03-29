import { emitDevTestEvent } from "~/lib/ws/events/dev/dev.test.ws";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { WSRoomRegistry } from "~/lib/ws/rooms.ws";

export const trpcDevRouter = createTRPCRouter({
  testUserSockets: protectedProcedure.mutation(({ ctx }) => {
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
});
