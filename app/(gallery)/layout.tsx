"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-6 md:px-12 lg:px-16">
          <Link href="/" className="text-xl font-bold tracking-tight">
            Poof!
          </Link>

          <nav className="flex items-center gap-6">
            <Link
              href="/gallery"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === "/gallery"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Gallery
            </Link>
            <Link
              href="/gallery/archive"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground",
                pathname === "/gallery/archive"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Archive
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-8 md:px-12 lg:px-16">{children}</main>
    </div>
  );
}
