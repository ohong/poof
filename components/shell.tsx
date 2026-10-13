"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus, Grid2X2, Archive, UserRound } from "lucide-react";
import { Brand } from "./brand";
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
          Sample collection. Changes stay in this tab.
          <Link href="/sign-in">
            Start your own <span aria-hidden="true">↗</span>
          </Link>
        </div>
      )}
      <header className="app-header">
        <Brand />
        <nav aria-label="Main navigation">
          <Link
            href={demo ? "/demo" : "/gallery"}
            className={path === "/gallery" || demo ? "current" : ""}
          >
            Collection
          </Link>
          {!demo && (
            <Link
              href="/archive"
              className={path === "/archive" ? "current" : ""}
            >
              Archive
            </Link>
          )}
        </nav>
        <div className="header-actions">
          {demo ? (
            <Link href="/sign-in" className="button primary compact">
              Make it yours
              <Plus size={16} />
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
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        <span>Less stuff. More space.</span>
        <Link href="/privacy">Privacy & data</Link>
      </footer>
      {!demo && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <Link
            href="/gallery"
            className={path === "/gallery" ? "current" : ""}
          >
            <Grid2X2 size={20} />
            Collection
          </Link>
          <Link href="/upload" className={path === "/upload" ? "current" : ""}>
            <Plus size={24} />
            Add photos
          </Link>
          <Link
            href="/archive"
            className={path === "/archive" ? "current" : ""}
          >
            <Archive size={20} />
            Archive
          </Link>
        </nav>
      )}
    </div>
  );
}
