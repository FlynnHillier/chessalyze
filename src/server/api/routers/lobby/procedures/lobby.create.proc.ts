import { LOBBYPROCEDURE } from "~/server/api/routers/lobby/lobby.proc";
import { trpcGameIsNotPresentMiddleware } from "~/server/api/routers/game/middleware/game.isNotPresent.mw";
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
      }),
    }),
  )
  .mutation(({ ctx, input }) => {
    const { id } = ctx.user;

    /**
     * Based on timing configuration option, convert template to verbose or just pass provided verbose times
     */
    const time: LobbyInstance["config"]["time"] = (() => {
      if (!input.config.time) return undefined;

      if (input.config.time.preset)
        return {
          preset: input.config.time.preset,
          verbose: {
            w: timedPresetNumberValues[input.config.time.preset],
            b: timedPresetNumberValues[input.config.time.preset],
          },
        };

      if (input.config.time.verbose)
        return {
          verbose: {
            w: input.config.time.verbose?.w,
            b: input.config.time.verbose?.b,
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
      },
      {
        time: time,
      },
    );

    return {
      lobby: {
        id: lobby.id,
        config: {
          time: lobby.config.time
            ? {
                preset: lobby.config.time.preset,
                verbose: lobby.config.time.verbose,
              }
            : undefined,
        },
      },
    };
  });
