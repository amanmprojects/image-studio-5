import { UserMenu } from "@/components/app/user-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { PropsWithChildren } from "react";

const links = [
  { href: "/studio", label: "Studio" },
  { href: "/gallery", label: "Gallery" },
  { href: "/collections", label: "Collections" },
];

export function AppShell({
  children,
  user,
}: PropsWithChildren<{
  user: { name: string; email: string };
}>) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link className="text-lg font-semibold tracking-tight" href="/studio">
              Image Studio
            </Link>
            <nav className="hidden items-center gap-2 md:flex">
              {links.map((link) => (
                <Button asChild key={link.href} size="sm" variant="ghost">
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </nav>
          </div>
          <UserMenu email={user.email} name={user.name} />
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
