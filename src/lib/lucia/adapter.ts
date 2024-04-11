import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "~/lib/drizzle/db";
import { users, sessions } from "~/lib/drizzle/auth.schema";

export const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);
