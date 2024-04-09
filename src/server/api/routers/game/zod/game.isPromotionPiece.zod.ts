import { z } from "zod";

export const zodIsPromotionPieceValidator = z.union([
  z.literal("r"),
  z.literal("n"),
  z.literal("b"),
  z.literal("q"),
]);
