import {
  timestamp,
  pgTable,
  text,
  varchar,
  integer,
  primaryKey,
  bigint,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

import { users } from "@lib/drizzle/auth.schema";
import { PROMOTIONPIECE, TILEIDS } from "~/constants/game";

// ENUMS
export const drizzleEnumTile = pgEnum("tile", TILEIDS);
export const drizzleEnumPromotionPiece = pgEnum(
  "promotion_piece",
  PROMOTIONPIECE,
);

// TABLES

export const games = pgTable("games", {
  p_white: varchar("p_white").references(() => users.id, {
    onDelete: "set null",
  }),
  p_black: varchar("p_black").references(() => users.id, {
    onDelete: "set null",
  }),
  id: varchar("id").notNull().primaryKey(),
});

export const moves = pgTable(
  "moves",
  {
    gameID: varchar("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    turn: integer("turn").notNull(),
    source: drizzleEnumTile("source").notNull(),
    target: drizzleEnumTile("target").notNull(),
    promotion: drizzleEnumPromotionPiece("promotion"),
    t_duration: bigint("t_duration", { mode: "bigint" }),
    t_start: bigint("t_start", { mode: "bigint" }),
    t_end: bigint("t_end", { mode: "bigint" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gameID, t.turn] }),
    unq: unique().on(t.gameID, t.turn),
  }),
);
