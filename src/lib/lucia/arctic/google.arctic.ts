import { Google } from "arctic";
import { env } from "~/env";

export const google = new Google(
  env.OAUTH_GOOGLE_CLIENTID,
  env.OAUTH_GOOGLE_CLIENTSECRET,
  `http://localhost:${env.PORT}/api/auth/callback/google`,
);
