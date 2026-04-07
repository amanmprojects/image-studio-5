import { auth } from "@/lib/auth";
import { bootstrapApp } from "@/lib/bootstrap";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";

export async function getCurrentSession() {
  await bootstrapApp();
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireSession() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

export async function getSessionFromHeaders(requestHeaders: Headers) {
  await bootstrapApp();
  return auth.api.getSession({
    headers: requestHeaders,
  });
}
