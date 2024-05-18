import { z, ZodType } from "zod";

export function zStringLiteralUnionFromArray(
  array: readonly [string, string, ...string[]],
) {
  return z.union([
    z.literal(array[0]),
    z.literal(array[1]),
    ...array.slice(2).map((s) => z.literal(s)),
  ]);
}

export function zRecord(keys: readonly string[], type: ZodType) {
  return z.object({
    ...keys.reduce((obj, key) => ({ ...obj, [key]: type }), {}),
  });
}
