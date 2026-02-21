ALTER TABLE "users" ADD COLUMN "discord_username" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "discord_discriminator" text NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "discord_global_username" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "lastseen_at" timestamp DEFAULT now();