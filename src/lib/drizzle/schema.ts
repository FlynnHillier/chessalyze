import * as GamesSchema from "@lib/drizzle/games.schema";
import * as AuthSchema from "@lib/drizzle/auth.schema";

export default {
  ...GamesSchema,
  ...AuthSchema,
};
