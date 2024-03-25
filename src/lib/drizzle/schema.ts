import { timestamp, pgTable, text, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  image: text("image"),
});

export const sessions = pgTable("session", {
  id: varchar("id", {
    length: 255,
  }).primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires", { mode: "date" }).notNull(),
});
