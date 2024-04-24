import { z } from "zod";
import { TILEIDS } from "@constants/game";

//LITERAL REQUIRES ATLEAST 2 ARGUMENTS SO 'a1' and 'a2' are HARDCODED (may cause errors in future if board dimensions are made mutable)
export const zodIsTileValidator = z.union([
  z.literal("a1"),
  z.literal("a2"),
  ...TILEIDS.map((tileID) => z.literal(tileID)),
]);
