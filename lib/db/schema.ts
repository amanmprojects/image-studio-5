import {
  index,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const collections = pgTable(
  "collections",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    name: text("name").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    uniqueIndex("idx_collections_user_name").on(t.userId, t.name),
    index("idx_collections_user_id").on(t.userId),
  ]
);

export const imageAssets = pgTable(
  "image_assets",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    prompt: text("prompt").notNull(),
    model: text("model").notNull(),
    provider: text("provider").notNull(),
    aspectRatio: text("aspect_ratio").notNull(),
    sourceType: text("source_type").notNull(),
    s3Key: text("s3_key").notNull(),
    mediaType: text("media_type").notNull(),
    // No FK: Aurora DSQL does not support FOREIGN KEY constraints.
    collectionId: text("collection_id"),
    createdAt: text("created_at").notNull(),
  },
  (t) => [
    index("idx_image_assets_user_id").on(t.userId, t.createdAt),
    index("idx_image_assets_collection_id").on(t.collectionId),
  ]
);
