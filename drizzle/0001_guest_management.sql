DROP TABLE "rsvps" CASCADE;--> statement-breakpoint
DROP TYPE "public"."rsvp_status";--> statement-breakpoint
CREATE TYPE "public"."rsvp_status" AS ENUM('pending', 'going', 'not_going');--> statement-breakpoint
CREATE TABLE "labels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "labels_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "guests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token" text NOT NULL,
	"name" text NOT NULL,
	"max_guests" integer DEFAULT 1 NOT NULL,
	"email" text,
	"phone" text,
	"admin_note" text,
	"status" "rsvp_status" DEFAULT 'pending' NOT NULL,
	"party_size" integer,
	"guest_note" text,
	"responded_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "guests_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "guest_labels" (
	"guest_id" uuid NOT NULL,
	"label_id" uuid NOT NULL,
	CONSTRAINT "guest_labels_guest_id_label_id_pk" PRIMARY KEY("guest_id","label_id")
);
--> statement-breakpoint
ALTER TABLE "guest_labels" ADD CONSTRAINT "guest_labels_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "guest_labels" ADD CONSTRAINT "guest_labels_label_id_labels_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."labels"("id") ON DELETE cascade ON UPDATE no action;