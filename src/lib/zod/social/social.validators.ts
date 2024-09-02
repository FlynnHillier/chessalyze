import { z } from "zod";

export const zSocialUser = z.object({
  id: z.string(),
  username: z.string(),
  imageURL: z.string().optional(),
});

export const zSocialActivity = z.object({
  isOnline: z.boolean(),
  game: z.string().optional(),
  status: z.object({
    primary: z.string().optional(),
    secondary: z.string().optional(),
  }),
});

export const zVerboseSocialUser = z.object({
  user: zSocialUser,
  activity: zSocialActivity,
});
