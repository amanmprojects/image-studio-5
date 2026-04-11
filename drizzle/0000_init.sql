CREATE TABLE "collections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "image_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"prompt" text NOT NULL,
	"model" text NOT NULL,
	"provider" text NOT NULL,
	"aspect_ratio" text NOT NULL,
	"source_type" text NOT NULL,
	"s3_key" text NOT NULL,
	"media_type" text NOT NULL,
	"collection_id" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "image_assets" ADD CONSTRAINT "image_assets_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_collections_user_name" ON "collections" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "idx_collections_user_id" ON "collections" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_image_assets_user_id" ON "image_assets" USING btree ("user_id","created_at" desc);--> statement-breakpoint
CREATE INDEX "idx_image_assets_collection_id" ON "image_assets" USING btree ("collection_id");