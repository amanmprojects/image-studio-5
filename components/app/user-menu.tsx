"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function UserMenu(props: { name: string; email: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleSignOut() {
    try {
      setIsPending(true);
      await signOut();
      router.replace("/sign-in");
      router.refresh();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2 text-sm">
      <div className="hidden text-right sm:block">
        <p className="font-medium">{props.name}</p>
        <p className="text-xs text-muted-foreground">{props.email}</p>
      </div>
      <Button
        onClick={handleSignOut}
        size="sm"
        type="button"
        variant="outline"
      >
        <LogOutIcon className="size-4" />
        {isPending ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}
