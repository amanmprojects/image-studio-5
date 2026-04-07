import { AppShell } from "@/components/app/app-shell";
import { PendingGenerationsProvider } from "@/components/app/pending-generations-context";
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
      <PendingGenerationsProvider>{children}</PendingGenerationsProvider>
    </AppShell>
  );
}
