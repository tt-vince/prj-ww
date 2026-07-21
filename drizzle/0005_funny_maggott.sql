ALTER TABLE "guests" ADD COLUMN "dietary" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "dietary_other" text;