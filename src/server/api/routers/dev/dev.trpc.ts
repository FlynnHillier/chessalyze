import { emitDevTestEvent } from "~/lib/ws/events/dev/dev.test.ws";
import { wsRoomRegistry } from "~/lib/ws/rooms.ws";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { Room } from "~/lib/ws/rooms.ws";
import { emitGameMoveEvent } from "~/lib/ws/events/game/game.move.event.ws";

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
  dummyMoveEvent: protectedProcedure.mutation(({ ctx }) => {
    const r = new Room();
    r.join(ctx.user.id);
    //Dummy move event
    emitGameMoveEvent(
      { room: r },
      {
        move: {
          source: "a1",
          target: "a2",
        },
        time: {
          isTimed: false,
          remaining: {
            w: 0,
            b: 0,
          },
        },
      },
    );
  }),
});
