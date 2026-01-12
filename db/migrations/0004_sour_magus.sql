DROP TABLE "product_images" CASCADE;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "images" jsonb DEFAULT '[]'::jsonb;