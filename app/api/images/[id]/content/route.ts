import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getImageAssetById } from "@/lib/db";
import { getS3BucketName, getS3Client } from "@/lib/s3";
import { getSessionFromHeaders } from "@/lib/session";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const record = getImageAssetById(id, session.user.id);

  if (!record) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  let s3Response;
  try {
    const command = new GetObjectCommand({
      Bucket: getS3BucketName(),
      Key: record.s3Key,
    });
    s3Response = await getS3Client().send(command);
  } catch (error) {
    if (error instanceof Error && error.message === "AWS S3 is not configured.") {
      return NextResponse.json({ message: "Storage not configured" }, { status: 500 });
    }
    return NextResponse.json(
      { message: "Failed to load image from storage." },
      { status: 502 }
    );
  }

  if (!s3Response.Body) {
    return NextResponse.json({ message: "Image not found in storage" }, { status: 404 });
  }

  const stream = s3Response.Body.transformToWebStream();

  return new Response(stream, {
    headers: {
      "Content-Type": record.mediaType,
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
