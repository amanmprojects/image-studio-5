import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "server-only";

const bucket = process.env.AWS_S3_BUCKET;
const region = process.env.AWS_REGION;
const publicUrlBase = process.env.S3_PUBLIC_URL_BASE?.replace(/\/$/, "") || null;

if (!bucket) {
  console.warn("AWS_S3_BUCKET is not configured.");
}

if (!region) {
  console.warn("AWS_REGION is not configured.");
}

export const s3 = new S3Client({
  region,
});

export async function uploadGeneratedImage(input: {
  key: string;
  body: Uint8Array;
  contentType: string;
}) {
  if (!bucket || !region) {
    throw new Error("AWS S3 is not configured.");
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType,
    })
  );
}

export async function getObjectUrl(key: string) {
  if (!bucket || !region) {
    throw new Error("AWS S3 is not configured.");
  }

  if (publicUrlBase) {
    return `${publicUrlBase}/${key}`;
  }

  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
    {
      expiresIn: 60 * 60,
    }
  );
}
