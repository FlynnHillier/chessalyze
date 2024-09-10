import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

import { trpcGameIsNotPresentMiddleware } from "~/server/api/routers/game/play/middleware/game.isNotPresent.mw";
import {
  trpcEnsuredLobbyIsPresentMiddlewareFactory,
  trpcLobbyIsNotPresentMiddleware,
  trpcLobbyIsPresentMiddleware,
} from "~/server/api/routers/lobby/middleware/lobby.middleware";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { LobbyMaster } from "~/lib/game/LobbyMaster";
import { zLobbyConfigurationPreference } from "~/lib/zod/lobby/lobby.validators";
import { LobbyInstance } from "~/lib/game/LobbyInstance";
import { getUserConfirmedFriends } from "~/lib/drizzle/queries/social.queries.drizzle";

/**
 * User Lobby interaction flow
 *
 * (create lobby on server) .configure.create
 * -> (open avenue for another user to join) .configure.invite.send / .configure.link.enable
 * -> (other user join lobby) .join
 *
 * Lobbys will automatically close after a specified amount of time, or prematurely if the user requests it.
 */

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
    create: protectedProcedure
      .use(trpcGameIsNotPresentMiddleware)
      .use(trpcLobbyIsNotPresentMiddleware)
      .input(zLobbyConfigurationPreference)
      .mutation(({ ctx, input }) => {
        const DEFAULT_LOBBY_ACCESSIBILITY: LobbyInstance["accessibility"] = {
          allowPublicLink: false,
          invited: new Set(),
        };

        const lobby = new LobbyInstance(
          {
            pid: ctx.user.id,
            username: ctx.user.name,
            image: ctx.user.image,
          },
          {
            accessibility: DEFAULT_LOBBY_ACCESSIBILITY,
            config: {
              color: input.color,
              time: input.time,
            },
          },
        );

        return lobby.verboseSnapshot();
      }),
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
        .use(trpcLobbyIsPresentMiddleware)
        .input(
          z.object({
            playerID: z.string(),
          }),
        )
        .mutation(async ({ ctx, input }) => {
          if (input.playerID === ctx.user.id)
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You cannot invite yourself.",
            });

          // Users can only players they are friends with.
          const ownFriends = await getUserConfirmedFriends(ctx.user.id);
          if (!ownFriends.find(({ id }) => id === input.playerID))
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "You can only invite friended players",
            });

          ctx.lobby.invitePlayers(input.playerID);

          return {
            snapshot: ctx.lobby.verboseSnapshot(),
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

          return { snapshot: ctx.lobby.verboseSnapshot() };
        }),
    }),
    link: createTRPCRouter({
      enable: protectedProcedure
        .use(trpcLobbyIsPresentMiddleware)
        .mutation(({ ctx, input }) => {
          ctx.lobby.setAllowPublicLink(true);

          return {
            snapshot: ctx.lobby.verboseSnapshot(),
          };
        }),
      disable: protectedProcedure
        .use(trpcLobbyIsPresentMiddleware)
        .mutation(({ ctx }) => {
          ctx.lobby.setAllowPublicLink(false);

          return {
            snapshot: ctx.lobby.verboseSnapshot(),
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
  invites: createTRPCRouter({
    incoming: protectedProcedure.query(({ ctx }) => {
      return LobbyMaster.instance()
        .getPlayerIncomingInvites(ctx.user.id)
        .map((lobbyID) => {
          return LobbyMaster.instance().get(lobbyID)?.nonVerboseSnapshot();
        })
        .filter((v) => v !== undefined);
    }),
  }),
});
