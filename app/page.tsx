"use client";

import Link from "next/link";
import { motion } from "motion/react";

export default function Home() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-background overflow-hidden">
      {/* Subtle grain texture overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Navigation - minimal, refined */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-5 sm:px-6 sm:py-6 md:px-12 lg:px-20"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <Link
          href="/"
          className="text-xs sm:text-sm font-medium tracking-[0.2em] uppercase"
        >
          Poof!
        </Link>
        <Link
          href="/gallery"
          className="text-xs sm:text-sm tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        >
          Enter
        </Link>
      </motion.nav>

      {/* Hero Section - vast, contemplative */}
      <main className="flex flex-1 flex-col items-start justify-center px-5 sm:px-6 md:px-12 lg:px-20">
        <div className="max-w-5xl w-full">
          {/* Main headline - responsive sizing */}
          <motion.h1
            className="text-[2rem] font-normal leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            See everything
            <br />
            you own.
          </motion.h1>

          <motion.p
            className="mt-2 sm:mt-3 text-[2rem] font-normal leading-[1.05] tracking-tight text-muted-foreground sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            Then let it go.
          </motion.p>

          {/* Subtext - museum label style */}
          <motion.div
            className="mt-10 sm:mt-14 md:mt-16 max-w-sm sm:max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="font-serif text-sm sm:text-base leading-relaxed text-muted-foreground md:text-lg">
              Transform your belongings into a museum-quality visual inventory.
              Upload photos, receive AI-curated descriptions, decide what stays.
            </p>
          </motion.div>

          {/* CTA - stark, decisive */}
          <motion.div
            className="mt-8 sm:mt-10 md:mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              href="/gallery"
              className="group inline-flex items-center gap-2 sm:gap-3 border-b border-foreground pb-1 text-xs sm:text-sm font-medium tracking-wide transition-all hover:gap-4 sm:hover:gap-5"
            >
              <span>Begin your catalog</span>
              <svg
                className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer - attribution, archival */}
      <motion.footer
        className="px-5 py-6 sm:px-6 sm:py-8 md:px-12 lg:px-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.1 }}
      >
        <p className="font-serif text-[10px] sm:text-xs italic text-muted-foreground/70">
          Inspired by Barbara Iweins&apos;s Katalog — 10,532 objects, photographed over two years.
          <span className="hidden sm:inline">
            <br />
            We compress that into an afternoon.
          </span>
        </p>
      </motion.footer>

      {/* Decorative element - vertical line (hidden on mobile) */}
      <motion.div
        className="fixed bottom-0 left-1/2 h-16 sm:h-20 md:h-24 w-px bg-border/50 hidden sm:block"
        initial={{ scaleY: 0, opacity: 0 }}
        animate={{ scaleY: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.3, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformOrigin: 'bottom' }}
      />

      {/* Scroll indicator for mobile */}
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 sm:hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.3 }}
      >
        <motion.div
          className="h-8 w-5 rounded-full border border-border/50 flex items-start justify-center p-1"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-1.5 w-1 rounded-full bg-muted-foreground/50" />
        </motion.div>
      </motion.div>
    </div>
  );
}
