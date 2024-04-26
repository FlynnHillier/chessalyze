import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { trpcGameIsNotPresentMiddleware } from "~/server/api/routers/game/play/middleware/game.isNotPresent.mw";
import { trpcLobbyIsNotPresentMiddleware } from "~/server/api/routers/lobby/middleware/lobby.isNotPresent.mw";
import {
  LobbyInstance,
  timedPresetNumberValues,
} from "~/lib/game/LobbyInstance";
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

    /**
     * Based on timing configuration option, convert template to verbose or just pass provided verbose times
     */
    const time: LobbyInstance["config"]["time"] = (() => {
      if (!_time) return undefined;

      if (_time.preset)
        return {
          preset: _time.preset,
          verbose: {
            w: timedPresetNumberValues[_time.preset],
            b: timedPresetNumberValues[_time.preset],
          },
        };

      if (_time.verbose)
        return {
          verbose: {
            w: _time.verbose?.w,
            b: _time.verbose?.b,
          },
        };

      // Should not happen.
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "invalid timing option payload",
      });
    })();

    const lobby = new LobbyInstance(
      {
        pid: id,
        image: ctx.user.image,
        username: ctx.user.name,
      },
      {
        time: time,
        color: color,
      },
    );

    return {
      lobby: {
        id: lobby.id,
        config: {
          time: time,
          color: color,
        },
      },
    };
  });
