import {
  timestamp,
  pgTable,
  text,
  varchar,
  integer,
  primaryKey,
  bigint,
} from "drizzle-orm/pg-core";

import { users } from "@lib/drizzle/auth.schema";

export const games = pgTable("games", {
  p_white: varchar("p_white")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  p_black: varchar("p_black")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  id: varchar("id").notNull().primaryKey(),
});

export const moves = pgTable(
  "moves",
  {
    gameID: varchar("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    turn: integer("turn").notNull().unique(),
    source: text("source").notNull(),
    target: text("target").notNull(),
    t_duration: timestamp("t_duration", { withTimezone: false }),
    t_start: timestamp("t_start", { withTimezone: true }),
    t_end: timestamp("t_start", { withTimezone: true }),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.gameID, table.turn] }),
    };
  },
);
