import { z } from "zod";

/**
 * Validate valid time preset for lobby configuration
 */
export const zodGameTimePreset = z.union([
  z.literal("30s"),
  z.literal("1m"),
  z.literal("5m"),
  z.literal("10m"),
  z.literal("15m"),
  z.literal("30m"),
  z.literal("1h"),
]);
