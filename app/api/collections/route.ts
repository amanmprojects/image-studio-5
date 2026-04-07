import {
  createCollectionInputSchema,
  createUserCollection,
  getUserCollections,
} from "@/lib/image-service";
import { getSessionFromHeaders } from "@/lib/session";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const collections = await getUserCollections(session.user.id);
  return NextResponse.json({ data: collections });
}

export async function POST(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createCollectionInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        message: parsed.error.issues[0]?.message || "Invalid request body.",
      },
      { status: 400 }
    );
  }

  try {
    const collection = await createUserCollection(session.user.id, parsed.data.name);
    return NextResponse.json({ data: collection });
  } catch (error) {
    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Failed to create collection.",
      },
      { status: 500 }
    );
  }
}
