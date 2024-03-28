import { emitDevTestEvent } from "~/lib/ws/events/dev/dev.test.ws";
import { wsRoomRegistry } from "~/lib/ws/rooms.ws";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const trpcDevRouter = createTRPCRouter({
  testUserSockets: protectedProcedure.mutation(({ ctx }) => {
    const testRoom = wsRoomRegistry.getOrCreate("testRoom");
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
