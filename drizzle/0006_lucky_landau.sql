CREATE TYPE "public"."companion_kind" AS ENUM('adult', 'kid');--> statement-breakpoint
CREATE TABLE "companions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"kind" "companion_kind" NOT NULL,
	"position" integer NOT NULL,
	"name" text NOT NULL,
	"dietary" text[] DEFAULT '{}'::text[] NOT NULL,
	"dietary_other" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "companions" ADD CONSTRAINT "companions_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "companions_guest_kind_position_idx" ON "companions" USING btree ("guest_id","kind","position");