CREATE TYPE "public"."spot_category" AS ENUM('restaurant', 'coffee', 'hotel', 'other');--> statement-breakpoint
CREATE TABLE "spots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"category" "spot_category" NOT NULL,
	"url" text,
	"address" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
