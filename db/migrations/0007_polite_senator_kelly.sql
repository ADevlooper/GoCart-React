ALTER TABLE "product_images" ADD COLUMN "thumbnail_url" varchar(500);--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "preview_url" varchar(500);--> statement-breakpoint
ALTER TABLE "product_images" ADD COLUMN "original_url" varchar(500);--> statement-breakpoint
ALTER TABLE "product_images" DROP COLUMN "type";--> statement-breakpoint
ALTER TABLE "product_images" DROP COLUMN "url";--> statement-breakpoint
DROP TYPE "public"."image_type";