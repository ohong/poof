"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Header - museum-style minimal */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="flex h-14 sm:h-16 items-center justify-between border-b border-border/50 px-4 sm:px-6 md:px-12 lg:px-20">
          <Link
            href="/"
            className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase transition-opacity hover:opacity-60"
          >
            Poof!
          </Link>

          <nav className="flex items-center gap-4 sm:gap-6 md:gap-8">
            <Link
              href="/gallery"
              className={cn(
                "relative text-xs sm:text-sm tracking-wide transition-colors",
                pathname === "/gallery"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="hidden sm:inline">Collection</span>
              <span className="sm:hidden">Items</span>
              {pathname === "/gallery" && (
                <span className="absolute -bottom-[1.1rem] sm:-bottom-[1.5rem] left-0 right-0 h-px bg-foreground" />
              )}
            </Link>
            <Link
              href="/gallery/upload"
              className={cn(
                "relative text-xs sm:text-sm tracking-wide transition-colors",
                pathname === "/gallery/upload"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Upload
              {pathname === "/gallery/upload" && (
                <span className="absolute -bottom-[1.1rem] sm:-bottom-[1.5rem] left-0 right-0 h-px bg-foreground" />
              )}
            </Link>
            <Link
              href="/gallery/archive"
              className={cn(
                "relative text-xs sm:text-sm tracking-wide transition-colors",
                pathname === "/gallery/archive"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Archive
              {pathname === "/gallery/archive" && (
                <span className="absolute -bottom-[1.1rem] sm:-bottom-[1.5rem] left-0 right-0 h-px bg-foreground" />
              )}
            </Link>
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7 sm:h-8 sm:w-8",
                },
              }}
            />
          </nav>
        </div>
      </header>

      {/* Main Content - generous whitespace */}
      <main className="px-4 py-8 sm:px-6 sm:py-12 md:px-12 md:py-16 lg:px-20 lg:py-20">
        {children}
      </main>

      {/* Subtle grain texture */}
      <div
        className="pointer-events-none fixed inset-0 z-[-1] opacity-[0.012]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
