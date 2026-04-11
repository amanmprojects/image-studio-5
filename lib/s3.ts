import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "server-only";

const publicUrlBase = process.env.S3_PUBLIC_URL_BASE?.replace(/\/$/, "") || null;

if (!process.env.AWS_S3_BUCKET) {
  console.warn("AWS_S3_BUCKET is not configured.");
}

if (!process.env.AWS_REGION) {
  console.warn("AWS_REGION is not configured.");
}

function requireS3Env(): { bucket: string; region: string } {
  const bucket = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;
  if (!bucket || !region) {
    throw new Error("AWS S3 is not configured.");
  }
  return { bucket, region };
}

let s3Client: S3Client | null = null;
let cachedRegion: string | null = null;

export function getS3Client(): S3Client {
  const { region } = requireS3Env();
  if (!s3Client || cachedRegion !== region) {
    s3Client = new S3Client({ region });
    cachedRegion = region;
  }
  return s3Client;
}

export function getS3BucketName(): string {
  return requireS3Env().bucket;
}

export async function uploadGeneratedImage(input: {
  key: string;
  body: Uint8Array;
  contentType: string;
}) {
  const { bucket } = requireS3Env();
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    })
  );
}

/** Best-effort removal after a failed DB write to avoid orphan objects. */
export async function deleteGeneratedImage(key: string) {
  const { bucket } = requireS3Env();
  await getS3Client().send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  );
}

export async function getObjectUrl(key: string) {
  const { bucket } = requireS3Env();

  if (publicUrlBase) {
    return `${publicUrlBase}/${key}`;
  }

  return getSignedUrl(
    getS3Client(),
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    {
      expiresIn: 60 * 60,
    }
  );
}
