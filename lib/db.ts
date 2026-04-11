import type { CollectionRecord, ImageAssetRecord } from "@/lib/app-types";
import Database from "better-sqlite3";
import "server-only";

const databasePath = process.env.SQLITE_DATABASE_PATH || "image-studio.db";

export const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

let appTablesPromise: Promise<void> | null = null;

export function ensureAppTables() {
  if (!appTablesPromise) {
    appTablesPromise = Promise.resolve().then(() => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS collections (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          name TEXT NOT NULL,
          created_at TEXT NOT NULL
        );

        CREATE UNIQUE INDEX IF NOT EXISTS idx_collections_user_name
        ON collections (user_id, name);

        CREATE INDEX IF NOT EXISTS idx_collections_user_id
        ON collections (user_id);

        CREATE TABLE IF NOT EXISTS image_assets (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          prompt TEXT NOT NULL,
          model TEXT NOT NULL,
          provider TEXT NOT NULL,
          aspect_ratio TEXT NOT NULL,
          source_type TEXT NOT NULL,
          s3_key TEXT NOT NULL,
          media_type TEXT NOT NULL,
          collection_id TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE SET NULL
        );

        CREATE INDEX IF NOT EXISTS idx_image_assets_user_id
        ON image_assets (user_id, created_at DESC);

        CREATE INDEX IF NOT EXISTS idx_image_assets_collection_id
        ON image_assets (collection_id);
      `);
    });
  }

  return appTablesPromise;
}

function mapCollection(row: Record<string, unknown>): CollectionRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    createdAt: String(row.created_at),
  };
}

function mapImageAsset(row: Record<string, unknown>): ImageAssetRecord {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    prompt: String(row.prompt),
    model: String(row.model),
    provider: String(row.provider),
    aspectRatio: String(row.aspect_ratio),
    sourceType: row.source_type === "edit" ? "edit" : "text_to_image",
    s3Key: String(row.s3_key),
    mediaType: String(row.media_type),
    collectionId: row.collection_id ? String(row.collection_id) : null,
    createdAt: String(row.created_at),
  };
}

export function createCollection(input: {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
}) {
  const statement = db.prepare(
    `
      INSERT INTO collections (id, user_id, name, created_at)
      VALUES (@id, @userId, @name, @createdAt)
    `
  );

  statement.run(input);

  return getCollectionById(input.id, input.userId);
}

export function getCollectionById(id: string, userId: string) {
  const statement = db.prepare(
    `
      SELECT id, user_id, name, created_at
      FROM collections
      WHERE id = ? AND user_id = ?
    `
  );

  const row = statement.get(id, userId) as Record<string, unknown> | undefined;

  return row ? mapCollection(row) : null;
}

export function listCollections(userId: string) {
  const statement = db.prepare(
    `
      SELECT id, user_id, name, created_at
      FROM collections
      WHERE user_id = ?
      ORDER BY name COLLATE NOCASE ASC
    `
  );

  const rows = statement.all(userId) as Record<string, unknown>[];

  return rows.map(mapCollection);
}

export function createImageAsset(input: {
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
  const statement = db.prepare(
    `
      INSERT INTO image_assets (
        id,
        user_id,
        prompt,
        model,
        provider,
        aspect_ratio,
        source_type,
        s3_key,
        media_type,
        collection_id,
        created_at
      )
      VALUES (
        @id,
        @userId,
        @prompt,
        @model,
        @provider,
        @aspectRatio,
        @sourceType,
        @s3Key,
        @mediaType,
        @collectionId,
        @createdAt
      )
    `
  );

  statement.run(input);

  return getImageAssetById(input.id, input.userId);
}

export function getImageAssetById(id: string, userId: string) {
  const statement = db.prepare(
    `
      SELECT
        id,
        user_id,
        prompt,
        model,
        provider,
        aspect_ratio,
        source_type,
        s3_key,
        media_type,
        collection_id,
        created_at
      FROM image_assets
      WHERE id = ? AND user_id = ?
    `
  );

  const row = statement.get(id, userId) as Record<string, unknown> | undefined;

  return row ? mapImageAsset(row) : null;
}

export function listImageAssets(userId: string) {
  const statement = db.prepare(
    `
      SELECT
        id,
        user_id,
        prompt,
        model,
        provider,
        aspect_ratio,
        source_type,
        s3_key,
        media_type,
        collection_id,
        created_at
      FROM image_assets
      WHERE user_id = ?
      ORDER BY datetime(created_at) DESC
    `
  );

  const rows = statement.all(userId) as Record<string, unknown>[];

  return rows.map(mapImageAsset);
}

export function setImageAssetCollection(input: {
  imageId: string;
  userId: string;
  collectionId: string | null;
}) {
  const statement = db.prepare(
    `
      UPDATE image_assets
      SET collection_id = ?
      WHERE id = ? AND user_id = ?
    `
  );

  statement.run(input.collectionId, input.imageId, input.userId);

  return getImageAssetById(input.imageId, input.userId);
}

export function collectionExistsForUser(collectionId: string, userId: string) {
  const statement = db.prepare(
    `
      SELECT 1
      FROM collections
      WHERE id = ? AND user_id = ?
      LIMIT 1
    `
  );

  return Boolean(statement.get(collectionId, userId));
}

export function isSqliteUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "SQLITE_CONSTRAINT_UNIQUE"
  );
}
