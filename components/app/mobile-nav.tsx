"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpenIcon, ImagesIcon, WandSparklesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/studio", label: "Studio", Icon: WandSparklesIcon },
  { href: "/gallery", label: "Gallery", Icon: ImagesIcon },
  { href: "/collections", label: "Collections", Icon: FolderOpenIcon },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="flex items-stretch">
        {links.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 px-2 py-3 text-xs font-medium transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
