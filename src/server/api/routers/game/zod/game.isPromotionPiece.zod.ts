import { z } from "zod";

import { PROMOTIONPIECE } from "~/constants/game";

//HARDCODE TWO VALUES - AWAIT RESPONSE TO ISSUE OPENED IN ZOD REPO
export const zodIsPromotionPieceValidator = z.union([
  z.literal("q"),
  z.literal("r"),
  ...PROMOTIONPIECE.map((v) => z.literal(v)),
]);
