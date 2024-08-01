import { z } from "zod";
import { zBW, zColor, zGameTimePreset } from "~/lib/zod/game/game.validators";

const NonVerboseLobbySnapshot = {
  id: z.string(),
  config: z.object({
    color: z
      .object({
        preference: zColor,
      })
      .optional(),
    time: z
      .object({
        template: zGameTimePreset,
      })
      .optional(),
  }),
};

export const zNonVerboseLobbySnapshot = z.object(NonVerboseLobbySnapshot);

export const zVerboseLobbySnapshot = z.object({
  ...NonVerboseLobbySnapshot,
  accessibility: z.object({
    invited: z.array(z.string()),
    isPublicLinkAllowed: z.boolean(),
  }),
});

export const zLobbyConfigurationPreference = z.object({
  time: z
    .object({
      template: zGameTimePreset,
    })
    .optional(),
  color: zColor.optional(),
});
