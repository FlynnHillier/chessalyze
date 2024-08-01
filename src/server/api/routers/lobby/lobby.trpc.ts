import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { trpcGameIsNotPresentMiddleware } from "~/server/api/routers/game/play/middleware/game.isNotPresent.mw";
import {
  trpcEnsuredLobbyIsPresentMiddlewareFactory,
  trpcLobbyIsPresentMiddleware,
} from "~/server/api/routers/lobby/middleware/lobby.middleware";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { LobbyMaster } from "~/lib/game/LobbyMaster";
import { zLobbyConfigurationPreference } from "~/lib/zod/lobby/lobby.validators";
import { LobbyInstance } from "~/lib/game/LobbyInstance";

export const trpcLobbyRouter = createTRPCRouter({
  join: protectedProcedure
    .use(trpcGameIsNotPresentMiddleware)
    .input(
      z.object({
        lobbyID: z.string(),
      }),
    )
    .mutation(({ ctx, input }) => {
      const lobby = LobbyMaster.instance().get(input.lobbyID);

      if (!lobby)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "lobby not found",
        });

      const attemptJoinResult = lobby.join({
        pid: ctx.user.id,
        username: ctx.user.name,
        image: ctx.user.image,
      });

      if (!attemptJoinResult.success) {
        switch (attemptJoinResult.reason) {
          case "ATTEMPT_JOIN_SELF":
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You cannot join yourself.",
            });
          case "NOT_INVITED":
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You have not been invited to this lobby.",
            });
        }

        //If more fail reasons are added they will need to be handled here.
      }

      return {
        success: true,
        game: attemptJoinResult.game.snapshot(),
      };
    }),
  configure: createTRPCRouter({
    disband: protectedProcedure
      .use(trpcLobbyIsPresentMiddleware)
      .mutation(({ ctx }) => {
        ctx.lobby.end();

        return {
          success: true,
        };
      }),
    invite: createTRPCRouter({
      send: protectedProcedure
        .use(trpcGameIsNotPresentMiddleware)
        .use(
          trpcEnsuredLobbyIsPresentMiddlewareFactory({
            accessibility: {
              allowPublicLink: false,
              invited: new Set(),
            },
          }),
        )
        .input(
          z.object({
            playerID: z.string(),
          }),
        )
        .mutation(({ ctx, input }) => {
          if (input.playerID === ctx.user.id)
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You cannot invite yourself.",
            });

          ctx.lobby.invitePlayers(input.playerID);

          return {
            success: true,
          };
        }),
      revoke: protectedProcedure
        .use(trpcLobbyIsPresentMiddleware)
        .input(
          z.object({
            playerID: z.string(),
          }),
        )
        .mutation(({ ctx, input }) => {
          ctx.lobby.revokePlayerInvites(input.playerID);
        }),
    }),
    link: createTRPCRouter({
      enable: protectedProcedure
        .use(trpcGameIsNotPresentMiddleware)
        .input(zLobbyConfigurationPreference)
        .mutation(({ ctx, input }) => {
          const lobby =
            LobbyMaster.instance().getByPlayer(ctx.user.id) ??
            new LobbyInstance(
              {
                pid: ctx.user.id,
                username: ctx.user.name,
                image: ctx.user.image,
              },
              {
                accessibility: {
                  allowPublicLink: true,
                  invited: new Set(),
                },
                config: {
                  color: input.color && {
                    preference: input.color,
                  },
                  time: input.time && {
                    template: input.time.template,
                  },
                },
              },
            );

          lobby.setAllowPublicLink(true);

          return lobby.verboseSnapshot();
        }),
      disable: protectedProcedure
        .use(trpcLobbyIsPresentMiddleware)
        .mutation(({ ctx }) => {
          ctx.lobby.setAllowPublicLink(false);

          return {
            lobbyHasEnded: ctx.lobby.isEnded(),
            snapshot: ctx.lobby.isEnded()
              ? undefined
              : ctx.lobby.verboseSnapshot(),
          };
        }),
    }),
  }),
  query: createTRPCRouter({
    own: protectedProcedure.query(({ ctx }) => {
      const lobby = LobbyMaster.instance().getByPlayer(ctx.user.id);

      if (!lobby)
        return {
          exists: false,
        };

      return {
        exists: true,
        lobby: lobby.verboseSnapshot(),
      };
    }),
    user: protectedProcedure
      .input(
        z.object({
          playerID: z.string(),
        }),
      )
      .query(({ ctx, input }) => {
        const lobby = LobbyMaster.instance().getByPlayer(input.playerID);

        if (!lobby)
          return {
            exists: false,
          };

        if (!lobby.isPublicLinkAllowed() && !lobby.playerIsInvited(ctx.user.id))
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You do not have access to view this lobby.",
          });

        return {
          exists: true,
          lobby: lobby.nonVerboseSnapshot(),
        };
      }),
    id: protectedProcedure
      .input(
        z.object({
          lobbyID: z.string(),
        }),
      )
      .query(({ ctx, input }) => {
        const lobby = LobbyMaster.instance().get(input.lobbyID);

        if (!lobby)
          return {
            exists: false,
          };

        if (!lobby.isPublicLinkAllowed() && !lobby.playerIsInvited(ctx.user.id))
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "You do not have access to view this lobby.",
          });

        return {
          exists: true,
          lobby: lobby.nonVerboseSnapshot(),
        };
      }),
  }),
});
