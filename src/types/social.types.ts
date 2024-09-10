import { z } from "zod";
import {
  zSocialActivity,
  zSocialUser,
  zVerboseSocialUser,
} from "~/lib/zod/social/social.validators";

export type SocialUser = z.infer<typeof zSocialUser>;

export type VerboseSocialUser = z.infer<typeof zVerboseSocialUser>;

export type SocialActivity = z.infer<typeof zSocialActivity>;
