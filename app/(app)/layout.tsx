import { AppShell } from "@/components/app/app-shell";
import { requireSession } from "@/lib/session";
import type { PropsWithChildren } from "react";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({ children }: PropsWithChildren) {
  const session = await requireSession();

  return (
    <AppShell
      user={{
        email: session.user.email,
        name: session.user.name,
      }}
    >
      {children}
    </AppShell>
  );
}
