"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Grid2X2, Archive, UserRound, ArrowUpRight } from "lucide-react";
import { Brand } from "./brand";
import { previewMode } from "@/lib/experience";
export function Shell({
  children,
  email,
  demo = false,
}: {
  children: React.ReactNode;
  email?: string;
  demo?: boolean;
}) {
  const path = usePathname();
  return (
    <div className="app-shell">
      {demo && (
        <div className="demo-banner">
          <span>
            {previewMode ? "Product preview" : "Sample collection"}{" "}
            <span aria-hidden="true">·</span> Changes stay in this tab.
          </span>
        </div>
      )}
      <header className="app-header">
        <Brand />
        {!demo && (
          <nav aria-label="Main navigation">
            <Link
              href="/gallery"
              className={path === "/gallery" ? "current" : ""}
              aria-current={path === "/gallery" ? "page" : undefined}
            >
              Collection
            </Link>
            <Link
              href="/archive"
              className={path === "/archive" ? "current" : ""}
              aria-current={path === "/archive" ? "page" : undefined}
            >
              Archive
            </Link>
          </nav>
        )}
        <div className="header-actions">
          {demo ? (
            <Link
              href={previewMode ? "/" : "/sign-in"}
              className="button outline compact"
            >
              {previewMode ? "About Poof" : "Make it yours"}
              <ArrowUpRight size={16} />
            </Link>
          ) : (
            <>
              <Link href="/upload" className="button primary compact">
                <Plus size={17} />
                Add photos
              </Link>
              <Link
                href="/settings"
                className="account-link"
                title={email}
                aria-label="Account settings"
              >
                <UserRound size={19} />
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="app-main" id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer className="app-footer">
        <span>Less stuff. More space.</span>
        <Link href="/privacy">Privacy & data</Link>
      </footer>
      {!demo && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link
            href="/gallery"
            className={path === "/gallery" ? "current" : ""}
            aria-current={path === "/gallery" ? "page" : undefined}
          >
            <Grid2X2 size={20} />
            Collection
          </Link>
          <Link
            href="/upload"
            className={path === "/upload" ? "current" : ""}
            aria-current={path === "/upload" ? "page" : undefined}
          >
            <Plus size={24} />
            Add photos
          </Link>
          <Link
            href="/archive"
            className={path === "/archive" ? "current" : ""}
            aria-current={path === "/archive" ? "page" : undefined}
          >
            <Archive size={20} />
            Archive
          </Link>
        </nav>
      )}
    </div>
  );
}
