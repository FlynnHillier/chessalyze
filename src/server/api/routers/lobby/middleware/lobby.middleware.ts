import { TRPCError } from "@trpc/server";
import {
  createTRPCMiddleware,
  TRPCStandardNoAuthError,
} from "~/server/api/trpc";
import { LobbyMaster } from "~/lib/game/LobbyMaster";
import { LobbyInstance } from "~/lib/game/LobbyInstance";

export const trpcLobbyIsNotPresentMiddleware = createTRPCMiddleware(
  ({ ctx, next }) => {
    const existingUserLobby = LobbyMaster.instance().getByPlayer(ctx.user!.id);

    if (existingUserLobby !== null) {
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "User is already in lobby",
        cause: {
          lobby: {
            id: existingUserLobby.id,
          },
        },
      });
    }

    return next();
  },
);

export const trpcLobbyIsPresentMiddleware = createTRPCMiddleware(
  ({ ctx, next }) => {
    const existingUserLobby = LobbyMaster.instance().getByPlayer(ctx.user!.id);

    if (!existingUserLobby)
      throw new TRPCError({
        code: "PRECONDITION_FAILED",
        message: "user is not in lobby",
      });

    return next({
      ctx: {
        ...ctx,
        user: ctx.user!,
        lobby: existingUserLobby,
      },
    });
  },
);

export const trpcEnsuredLobbyIsPresentMiddlewareFactory = ({
  accessibility,
}: {
  accessibility: LobbyInstance["accessibility"];
}) =>
  createTRPCMiddleware(({ ctx, next }) => {
    if (!ctx.user) throw new TRPCStandardNoAuthError();

    const existingUserLobby = LobbyMaster.instance().getByPlayer(ctx.user.id);

    if (existingUserLobby)
      return next({
        ctx: {
          ...ctx,
          user: {
            ...ctx.user,
          },
          session: {
            ...ctx.session,
          },
          lobby: existingUserLobby,
        },
      });

    return next({
      ctx: {
        ...ctx,
        user: {
          ...ctx.user,
        },
        session: {
          ...ctx.session,
        },
        lobby: new LobbyInstance(
          {
            pid: ctx.user.id,
            username: ctx.user.name,
            image: ctx.user.image,
          },
          {
            accessibility,
          },
        ),
      },
    });
  });
