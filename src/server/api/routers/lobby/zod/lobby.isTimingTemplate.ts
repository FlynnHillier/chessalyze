import { z } from "zod";
import { TIME_PRESET } from "~/constants/game";

/**
 * Validate valid time preset for lobby configuration
 */
export const zodGameTimePreset = z.union([
  z.literal("30s"),
  z.literal("1m"),
  ...TIME_PRESET.map((t) => z.literal(t)),
]);
