import { getUserGallery } from "@/lib/image-service";
import { getSessionFromHeaders } from "@/lib/session";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await getSessionFromHeaders(request.headers);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const images = await getUserGallery(session.user.id);
  return NextResponse.json({ data: images });
}
