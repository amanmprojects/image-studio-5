import { AuroraDSQLPool } from "@aws/aurora-dsql-node-postgres-connector";
import { drizzle } from "drizzle-orm/node-postgres";
import { sql } from "drizzle-orm";

const pool = new AuroraDSQLPool({
  host: process.env.AURORA_DSQL_HOST!.trim(),
  user: (process.env.AURORA_DSQL_USER?.trim() || "admin"),
  database: process.env.AURORA_DSQL_DATABASE?.trim(),
  region: process.env.AURORA_DSQL_REGION?.trim(),
  max: 3,
  idleTimeoutMillis: 60_000,
});

const db = drizzle(pool);

const DDL = [
  // -- Auth tables (Better Auth core) --
  sql`CREATE TABLE IF NOT EXISTS "user" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "email" text NOT NULL,
    "emailVerified" boolean NOT NULL,
    "image" text,
    "createdAt" text NOT NULL,
    "updatedAt" text NOT NULL
  )`,
  sql`CREATE UNIQUE INDEX ASYNC IF NOT EXISTS "user_email_unique" ON "user" ("email")`,

  sql`CREATE TABLE IF NOT EXISTS "session" (
    "id" text PRIMARY KEY NOT NULL,
    "expiresAt" text NOT NULL,
    "token" text NOT NULL,
    "createdAt" text NOT NULL,
    "updatedAt" text NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL
  )`,
  sql`CREATE UNIQUE INDEX ASYNC IF NOT EXISTS "session_token_unique" ON "session" ("token")`,
  sql`CREATE INDEX ASYNC IF NOT EXISTS "session_userId_idx" ON "session" ("userId")`,

  sql`CREATE TABLE IF NOT EXISTS "account" (
    "id" text PRIMARY KEY NOT NULL,
    "accountId" text NOT NULL,
    "providerId" text NOT NULL,
    "userId" text NOT NULL,
    "accessToken" text,
    "refreshToken" text,
    "idToken" text,
    "accessTokenExpiresAt" text,
    "refreshTokenExpiresAt" text,
    "scope" text,
    "password" text,
    "createdAt" text NOT NULL,
    "updatedAt" text NOT NULL
  )`,
  sql`CREATE INDEX ASYNC IF NOT EXISTS "account_userId_idx" ON "account" ("userId")`,
  sql`CREATE UNIQUE INDEX ASYNC IF NOT EXISTS "account_provider_account_idx" ON "account" ("providerId", "accountId")`,

  sql`CREATE TABLE IF NOT EXISTS "verification" (
    "id" text PRIMARY KEY NOT NULL,
    "identifier" text NOT NULL,
    "value" text NOT NULL,
    "expiresAt" text NOT NULL,
    "createdAt" text NOT NULL,
    "updatedAt" text NOT NULL
  )`,
  sql`CREATE INDEX ASYNC IF NOT EXISTS "verification_identifier_idx" ON "verification" ("identifier")`,

  // -- App tables --
  sql`CREATE TABLE IF NOT EXISTS "collections" (
    "id" text PRIMARY KEY NOT NULL,
    "user_id" text NOT NULL,
    "name" text NOT NULL,
    "created_at" text NOT NULL
  )`,
  sql`CREATE UNIQUE INDEX ASYNC IF NOT EXISTS "idx_collections_user_name" ON "collections" ("user_id", "name")`,
  sql`CREATE INDEX ASYNC IF NOT EXISTS "idx_collections_user_id" ON "collections" ("user_id")`,

  sql`CREATE TABLE IF NOT EXISTS "image_assets" (
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
  )`,
  sql`CREATE INDEX ASYNC IF NOT EXISTS "idx_image_assets_user_id" ON "image_assets" ("user_id", "created_at")`,
  sql`CREATE INDEX ASYNC IF NOT EXISTS "idx_image_assets_collection_id" ON "image_assets" ("collection_id")`,
];

async function main() {
  console.log("Pushing schema to Aurora DSQL...");
  for (const stmt of DDL) {
    await db.execute(stmt);
  }
  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Schema push failed:", err);
  process.exit(1);
});
