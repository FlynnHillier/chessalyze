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
  boolean,
} from "drizzle-orm/pg-core";

import { users } from "@lib/drizzle/auth.schema";
import {
  PROMOTIONPIECE,
  TILEIDS,
  TERMINATIONS,
  COLOR,
  PIECE,
  TIME_PRESET,
} from "~/constants/game";
import { relations } from "drizzle-orm";

// ENUMS
export const drizzleEnumTile = pgEnum("tile", TILEIDS);
export const drizzleEnumPiece = pgEnum("piece", PIECE);
export const drizzleEnumPromotionPiece = pgEnum(
  "promotion_piece",
  PROMOTIONPIECE,
);
export const drizzleEnumTerminationMessages = pgEnum(
  "termination_message",
  TERMINATIONS,
);
export const drizzleEnumTerminationType = pgEnum("termination_type", [
  "w",
  "b",
  "draw",
]);
export const drizzleEnumColor = pgEnum("color", COLOR);
export const drizzleEnumTimePreset = pgEnum("time_preset", TIME_PRESET);

// TABLES

export const games = pgTable("games", {
  p_white_id: varchar("p_white").references(() => users.id, {
    onDelete: "set null",
  }),
  p_black_id: varchar("p_black").references(() => users.id, {
    onDelete: "set null",
  }),
  id: varchar("id").notNull().primaryKey(),
});

export const timings = pgTable("game_time", {
  gameID: varchar("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" })
    .primaryKey(),
  start: bigint("t_start", { mode: "number" }).notNull(),
  end: bigint("t_end", { mode: "number" }).notNull(),
  duration: bigint("t_duration", { mode: "number" }).notNull(),
  clock: boolean("clock").notNull(),
  clock_template: drizzleEnumTimePreset("clock_template"),
  clock_start_w: integer("clock_start_w"),
  clock_start_b: integer("clock_start_b"),
  clock_end_w: integer("clock_end_w"),
  clock_end_b: integer("clock_end_b"),
});

export const moves = pgTable(
  "game_moves",
  {
    gameID: varchar("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    fen: text("fen").notNull(),
    turn: integer("turn").notNull(),
    initiator_pid: varchar("initiator_id").references(() => users.id, {
      onDelete: "set null",
    }),
    initiator_color: drizzleEnumColor("initiator_color").notNull(),
    piece: drizzleEnumPiece("piece").notNull(),
    source: drizzleEnumTile("source").notNull(),
    target: drizzleEnumTile("target").notNull(),
    promotion: drizzleEnumPromotionPiece("promotion"),
    t_duration: bigint("t_duration", { mode: "number" }).notNull(),
    t_timestamp: bigint("t_timestamp", { mode: "number" }).notNull(),
    t_w_remaining: bigint("t_w_remaining", { mode: "number" }),
    t_b_remaining: bigint("t_b_remaining", { mode: "number" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gameID, t.turn] }),
    unq: unique().on(t.gameID, t.turn),
  }),
);

export const conclusions = pgTable("game_conclusions", {
  gameID: varchar("game_id")
    .notNull()
    .references(() => games.id, { onDelete: "cascade" })
    .primaryKey(),
  fen: text("fen").notNull(),
  termination_message: drizzleEnumTerminationMessages(
    "termination_message",
  ).notNull(),
  termination_type: drizzleEnumTerminationType("termination_type").notNull(),
  victor_pid: varchar("victor_pid").references(() => users.id, {
    onDelete: "set null",
  }),
});

export const captured = pgTable(
  "game_captured",
  {
    gameID: varchar("game_id")
      .notNull()
      .references(() => games.id, { onDelete: "cascade" }),
    turnIndex: integer("turn").notNull(),
    w_p: integer("w_p").notNull().default(0),
    w_r: integer("w_r").notNull().default(0),
    w_n: integer("w_n").notNull().default(0),
    w_q: integer("w_q").notNull().default(0),
    w_b: integer("w_b").notNull().default(0),
    b_p: integer("b_p").notNull().default(0),
    b_r: integer("b_r").notNull().default(0),
    b_n: integer("b_n").notNull().default(0),
    b_q: integer("b_q").notNull().default(0),
    b_b: integer("b_b").notNull().default(0),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.gameID, t.turnIndex] }),
    unq: unique().on(t.gameID, t.turnIndex),
  }),
);

// RELATIONS
export const gameRelations = relations(games, ({ many, one }) => ({
  moves: many(moves),
  player_white: one(users, {
    fields: [games.p_white_id],
    references: [users.id],
  }),
  player_black: one(users, {
    fields: [games.p_black_id],
    references: [users.id],
  }),
  conclusion: one(conclusions, {
    fields: [games.id],
    references: [conclusions.gameID],
  }),
  timings: one(timings, {
    fields: [games.id],
    references: [timings.gameID],
  }),
}));

export const movesRelations = relations(moves, ({ one }) => ({
  game: one(games, { fields: [moves.gameID], references: [games.id] }),
  initiator: one(users, {
    fields: [moves.initiator_pid],
    references: [users.id],
  }),
  captured: one(captured, {
    fields: [moves.gameID, moves.turn],
    references: [captured.gameID, captured.turnIndex],
  }),
}));

export const conclusionRelations = relations(conclusions, ({ one }) => ({
  victor: one(users, {
    fields: [conclusions.victor_pid],
    references: [users.id],
  }),
}));

export const timingsRelations = relations(timings, ({ one }) => ({
  game: one(games, { fields: [timings.gameID], references: [games.id] }),
}));

export const capturedRelations = relations(captured, ({ one }) => ({
  move: one(moves, {
    fields: [captured.gameID, captured.turnIndex],
    references: [moves.gameID, moves.turn],
  }),
}));
