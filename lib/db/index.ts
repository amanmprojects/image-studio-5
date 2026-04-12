import type { CollectionRecord, ImageAssetRecord } from "@/lib/app-types";
import { db } from "@/lib/db/drizzle";
import { collections, imageAssets } from "@/lib/db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import "server-only";

function mapCollection(row: typeof collections.$inferSelect): CollectionRecord {
  return {
    id: row.id,
    userId: row.userId,
    name: row.name,
    createdAt: row.createdAt,
  };
}

function mapImageAsset(row: typeof imageAssets.$inferSelect): ImageAssetRecord {
  return {
    id: row.id,
    userId: row.userId,
    prompt: row.prompt,
    model: row.model,
    provider: row.provider,
    aspectRatio: row.aspectRatio,
    sourceType: row.sourceType === "edit" ? "edit" : "text_to_image",
    s3Key: row.s3Key,
    mediaType: row.mediaType,
    collectionId: row.collectionId,
    createdAt: row.createdAt,
  };
}

export async function createCollection(input: {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}) {
  await db.insert(collections).values({
    id: input.id,
    userId: input.userId,
    name: input.name,
    createdAt: input.createdAt,
  });

  return getCollectionById(input.id, input.userId);
}

export async function getCollectionById(id: string, userId: string) {
  const rows = await db
    .select()
    .from(collections)
    .where(and(eq(collections.id, id), eq(collections.userId, userId)))
    .limit(1);

  const row = rows[0];
  return row ? mapCollection(row) : null;
}

export async function listCollections(userId: string) {
  const rows = await db
    .select()
    .from(collections)
    .where(eq(collections.userId, userId))
    .orderBy(sql`lower(${collections.name})`);

  return rows.map(mapCollection);
}

export async function createImageAsset(input: {
  id: string;
  userId: string;
  prompt: string;
  model: string;
  provider: string;
  aspectRatio: string;
  sourceType: "text_to_image" | "edit";
  s3Key: string;
  mediaType: string;
  collectionId: string | null;
  createdAt: string;
}) {
  await db.insert(imageAssets).values({
    id: input.id,
    userId: input.userId,
    prompt: input.prompt,
    model: input.model,
    provider: input.provider,
    aspectRatio: input.aspectRatio,
    sourceType: input.sourceType,
    s3Key: input.s3Key,
    mediaType: input.mediaType,
    collectionId: input.collectionId,
    createdAt: input.createdAt,
  });

  return getImageAssetById(input.id, input.userId);
}

export async function getImageAssetById(id: string, userId: string) {
  const rows = await db
    .select()
    .from(imageAssets)
    .where(and(eq(imageAssets.id, id), eq(imageAssets.userId, userId)))
    .limit(1);

  const row = rows[0];
  return row ? mapImageAsset(row) : null;
}

export async function listImageAssets(userId: string) {
  const rows = await db
    .select()
    .from(imageAssets)
    .where(eq(imageAssets.userId, userId))
    .orderBy(desc(imageAssets.createdAt));

  return rows.map(mapImageAsset);
}

export async function setImageAssetCollection(input: {
  imageId: string;
  userId: string;
  collectionId: string | null;
}) {
  await db
    .update(imageAssets)
    .set({ collectionId: input.collectionId })
    .where(
      and(eq(imageAssets.id, input.imageId), eq(imageAssets.userId, input.userId))
    );

  return getImageAssetById(input.imageId, input.userId);
}

export async function collectionExistsForUser(
  collectionId: string,
  userId: string
) {
  const rows = await db
    .select({ id: collections.id })
    .from(collections)
    .where(
      and(eq(collections.id, collectionId), eq(collections.userId, userId))
    )
    .limit(1);

  return rows.length > 0;
}

export function isPostgresUniqueConstraintError(error: unknown): boolean {
  let current: unknown = error;
  while (current && typeof current === "object") {
    const code = (current as { code?: unknown }).code;
    if (code === "23505") {
      return true;
    }
    current =
      "cause" in current
        ? (current as { cause: unknown }).cause
        : undefined;
    if (current === undefined) {
      break;
    }
  }
  return false;
}
