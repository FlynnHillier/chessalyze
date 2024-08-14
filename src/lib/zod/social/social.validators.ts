import { z } from "zod";

export const zSocialUser = z.object({
  id: z.string(),
  username: z.string(),
  imageURL: z.string().optional(),
});
