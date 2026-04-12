import { auth } from "@/lib/auth";
import { isNextProductionBuild } from "@/lib/is-build-phase";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "server-only";

export async function getCurrentSession() {
  if (isNextProductionBuild()) {
    return null;
  }
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
  if (isNextProductionBuild()) {
    return null;
  }
  return auth.api.getSession({
    headers: requestHeaders,
  });
}
