ALTER TABLE "wishlist" ADD COLUMN "user_id" integer DEFAULT null;--> statement-breakpoint
ALTER TABLE "wishlist" ADD COLUMN "created_at" timestamp DEFAULT now();