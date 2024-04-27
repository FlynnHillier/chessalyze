import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { trpcGameIsNotPresentMiddleware } from "~/server/api/routers/game/play/middleware/game.isNotPresent.mw";
import { trpcLobbyIsNotPresentMiddleware } from "~/server/api/routers/lobby/middleware/lobby.isNotPresent.mw";
import { LobbyInstance } from "~/lib/game/LobbyInstance";
import { z } from "zod";
import { zodGameTimePreset } from "~/server/api/routers/lobby/zod/lobby.isTimingTemplate";
import { TRPCError } from "@trpc/server";

export const trpcLobbyCreateProcedure = LOBBYPROCEDURE.use(
  trpcLobbyIsNotPresentMiddleware,
)
  .use(trpcGameIsNotPresentMiddleware)
  .input(
    z.object({
      config: z.object({
        time: z
          .object({
            verbose: z.object({
              w: z.number(),
              b: z.number(),
            }),
            preset: zodGameTimePreset,
          })
          .partial()
          .refine(
            ({ verbose, preset }) =>
              (verbose !== undefined || preset !== undefined) &&
              !(verbose === undefined && preset === undefined),
            {
              message: `at most/least one field 'verbose' | 'preset' must be defined.`,
            },
          )
          .optional(),
        color: z
          .object({
            preference: z.union([z.literal("w"), z.literal("b")]),
          })
          .optional(),
      }),
    }),
  )
  .mutation(({ ctx, input }) => {
    const { id, email } = ctx.user;

    const { time: _time, color } = input.config;

    const lobby = new LobbyInstance(
      {
        pid: id,
        image: ctx.user.image,
        username: ctx.user.name,
      },
      {
        time:
          _time &&
          ((_time.preset && { template: _time.preset }) ||
            (_time.verbose && { absolute: _time.verbose })),
        color: color,
      },
    );

    return {
      lobby: {
        id: lobby.id,
        config: {
          time: _time,
          color: color,
        },
      },
    };
  });
