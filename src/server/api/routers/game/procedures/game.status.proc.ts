import { GAMEPROCEDURE } from "~/server/api/routers/game/game.proc";
import { GameMaster } from "~/lib/game/GameMaster";

export const trpcGameStatusProcedure = GAMEPROCEDURE.query(({ ctx }) => {
  const existingGame = GameMaster.instance().getByPlayer(ctx.user.id);

  if (existingGame === null) {
    return {
      present: false,
    } as const;
  }

  return {
    present: true,
    game: existingGame.snapshot(),
  };
});
