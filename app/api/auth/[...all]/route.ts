import { auth } from "@/lib/auth";
import { bootstrapApp } from "@/lib/bootstrap";
import { toNextJsHandler } from "better-auth/next-js";

const authHandler = toNextJsHandler(auth);

export const runtime = "nodejs";

export async function GET(request: Request) {
  await bootstrapApp();
  return authHandler.GET(request);
}

export async function POST(request: Request) {
  await bootstrapApp();
  return authHandler.POST(request);
}

export async function PATCH(request: Request) {
  await bootstrapApp();
  return authHandler.PATCH(request);
}

export async function PUT(request: Request) {
  await bootstrapApp();
  return authHandler.PUT(request);
}

export async function DELETE(request: Request) {
  await bootstrapApp();
  return authHandler.DELETE(request);
}
