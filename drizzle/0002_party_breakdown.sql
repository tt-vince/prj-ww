ALTER TABLE "guests" ADD COLUMN "adults" integer;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN "kids" integer;--> statement-breakpoint
ALTER TABLE "guests" DROP COLUMN "party_size";