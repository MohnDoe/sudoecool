CREATE TABLE "daily_puzzles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"date" text NOT NULL UNIQUE,
	"puzzle" jsonb NOT NULL,
	"solution" jsonb NOT NULL,
	"difficulty" text NOT NULL,
	"seed" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"puzzle_id" text NOT NULL,
	"current_state" jsonb NOT NULL,
	"moves" integer DEFAULT 0 NOT NULL,
	"hints" integer DEFAULT 0 NOT NULL,
	"time_spent" integer DEFAULT 0 NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"last_saved_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "game_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" uuid NOT NULL,
	"puzzle_id" text NOT NULL,
	"time_taken" integer NOT NULL,
	"moves" integer NOT NULL,
	"hints" integer NOT NULL,
	"difficulty" text NOT NULL,
	"score" integer NOT NULL,
	"completed_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"discord_id" text NOT NULL UNIQUE,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "game_progress" ADD CONSTRAINT "game_progress_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "game_progress" ADD CONSTRAINT "game_progress_puzzle_id_daily_puzzles_id_fkey" FOREIGN KEY ("puzzle_id") REFERENCES "daily_puzzles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_user_id_users_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "game_results" ADD CONSTRAINT "game_results_puzzle_id_daily_puzzles_id_fkey" FOREIGN KEY ("puzzle_id") REFERENCES "daily_puzzles"("id") ON DELETE CASCADE;