DO $$ BEGIN
 CREATE TYPE "color" AS ENUM('w', 'b');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "piece" AS ENUM('p', 'r', 'n', 'b', 'q', 'k');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "promotion_piece" AS ENUM('r', 'n', 'b', 'q');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "termination_message" AS ENUM('3-fold repitition', '50 move rule', 'insufficient material', 'stalemate', 'timeout vs insufficient material', 'checkmate', 'timeout', 'resignation');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "termination_type" AS ENUM('w', 'b', 'draw');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "tile" AS ENUM('a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8', 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8', 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "time_preset" AS ENUM('30s', '1m', '5m', '10m', '15m', '30m', '1h');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "status" AS ENUM('pending', 'confirmed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_captured" (
	"game_id" varchar NOT NULL,
	"turn" integer NOT NULL,
	"w_p" integer DEFAULT 0 NOT NULL,
	"w_r" integer DEFAULT 0 NOT NULL,
	"w_n" integer DEFAULT 0 NOT NULL,
	"w_q" integer DEFAULT 0 NOT NULL,
	"w_b" integer DEFAULT 0 NOT NULL,
	"b_p" integer DEFAULT 0 NOT NULL,
	"b_r" integer DEFAULT 0 NOT NULL,
	"b_n" integer DEFAULT 0 NOT NULL,
	"b_q" integer DEFAULT 0 NOT NULL,
	"b_b" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "game_captured_game_id_turn_pk" PRIMARY KEY("game_id","turn"),
	CONSTRAINT "game_captured_game_id_turn_unique" UNIQUE("game_id","turn")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_conclusions" (
	"game_id" varchar PRIMARY KEY NOT NULL,
	"fen" text NOT NULL,
	"termination_message" "termination_message" NOT NULL,
	"termination_type" "termination_type" NOT NULL,
	"victor_pid" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "games" (
	"p_white" varchar,
	"p_black" varchar,
	"id" varchar PRIMARY KEY NOT NULL,
	"serial" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_moves" (
	"game_id" varchar NOT NULL,
	"fen" text NOT NULL,
	"turn" integer NOT NULL,
	"initiator_id" varchar,
	"initiator_color" "color" NOT NULL,
	"piece" "piece" NOT NULL,
	"source" "tile" NOT NULL,
	"target" "tile" NOT NULL,
	"promotion" "promotion_piece",
	"t_duration" bigint NOT NULL,
	"t_timestamp" bigint NOT NULL,
	"t_w_remaining" bigint,
	"t_b_remaining" bigint,
	CONSTRAINT "game_moves_game_id_turn_pk" PRIMARY KEY("game_id","turn"),
	CONSTRAINT "game_moves_game_id_turn_unique" UNIQUE("game_id","turn")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "game_time" (
	"game_id" varchar PRIMARY KEY NOT NULL,
	"t_start" bigint NOT NULL,
	"t_end" bigint NOT NULL,
	"t_duration" bigint NOT NULL,
	"clock" boolean NOT NULL,
	"clock_template" "time_preset",
	"clock_start_w" integer,
	"clock_start_b" integer,
	"clock_end_w" integer,
	"clock_end_b" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "account_connections" (
	"id" varchar NOT NULL,
	"type" text NOT NULL,
	"provider_account_id" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "account_connections_type_provider_account_id_pk" PRIMARY KEY("type","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "session" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"image" text,
	"permission" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "friends" (
	"user1" varchar NOT NULL,
	"user2" varchar NOT NULL,
	"status" "status",
	"pending_accept" varchar,
	CONSTRAINT "friends_user1_user2_pk" PRIMARY KEY("user1","user2"),
	CONSTRAINT "friends_user1_user2_unique" UNIQUE("user1","user2")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_captured" ADD CONSTRAINT "game_captured_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_conclusions" ADD CONSTRAINT "game_conclusions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_conclusions" ADD CONSTRAINT "game_conclusions_victor_pid_user_id_fk" FOREIGN KEY ("victor_pid") REFERENCES "user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "games" ADD CONSTRAINT "games_p_white_user_id_fk" FOREIGN KEY ("p_white") REFERENCES "user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "games" ADD CONSTRAINT "games_p_black_user_id_fk" FOREIGN KEY ("p_black") REFERENCES "user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_moves" ADD CONSTRAINT "game_moves_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_moves" ADD CONSTRAINT "game_moves_initiator_id_user_id_fk" FOREIGN KEY ("initiator_id") REFERENCES "user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_time" ADD CONSTRAINT "game_time_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "account_connections" ADD CONSTRAINT "account_connections_id_user_id_fk" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friends" ADD CONSTRAINT "friends_user1_user_id_fk" FOREIGN KEY ("user1") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "friends" ADD CONSTRAINT "friends_user2_user_id_fk" FOREIGN KEY ("user2") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
