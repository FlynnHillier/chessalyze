import z from "zod";

enum TRPCGameSummaryLimits {
  MAX = 50,
  MIN = 0,
  DEFAULT = 20,
}

export const zLimitedGameSummaryCount = z
  .number()
  .max(TRPCGameSummaryLimits.MAX)
  .min(TRPCGameSummaryLimits.MIN)
  .default(TRPCGameSummaryLimits.DEFAULT);
