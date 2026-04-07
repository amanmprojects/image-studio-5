import {
  moveImageToCollectionInputSchema,
  moveUserImageToCollection,
} from "@/lib/image-service";
import { getSessionFromHeaders } from "@/lib/session";
import { z } from "zod";
import { NextResponse } from "next/server";

const moveImageSchema = moveImageToCollectionInputSchema.extend({
  imageId: z.string().trim().min(1),
});

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = moveImageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message || "Invalid request body.",
      },
      { status: 400 }
    );
  }

  try {
    const image = await moveUserImageToCollection({
      imageId: parsed.data.imageId,
      collectionId: parsed.data.collectionId,
      userId: session.user.id,
    });

    return NextResponse.json({ data: image });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Failed to move image.",
      },
      { status: 500 }
    );
  }
}
