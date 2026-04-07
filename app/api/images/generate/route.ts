import {
  generateAndStoreImage,
  generateImageInputSchema,
} from "@/lib/image-service";
import { getSessionFromHeaders } from "@/lib/session";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = generateImageInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message || "Invalid request body.",
      },
      { status: 400 }
    );
  }

  try {
    const image = await generateAndStoreImage({
      userId: session.user.id,
      ...parsed.data,
    });

    return NextResponse.json({ data: image });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to generate image.",
      },
      { status: 500 }
    );
  }
}
