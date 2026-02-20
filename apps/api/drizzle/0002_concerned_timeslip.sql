DO $$ BEGIN CREATE TYPE "public"."streak_code" AS ENUM('W', 'L', 'OT'); EXCEPTION WHEN duplicate_object THEN null; END $$;--> statement-breakpoint
ALTER TABLE "standings" ALTER COLUMN "season" SET DATA TYPE varchar(7);--> statement-breakpoint
ALTER TABLE "standings" ALTER COLUMN "streak_code" SET DATA TYPE "public"."streak_code" USING "streak_code"::"public"."streak_code";