"use client";

import { motion } from "motion/react";

interface GalleryHeaderProps {
  count: number;
}

export function GalleryHeader({ count }: GalleryHeaderProps) {
  return (
    <motion.div
      className="mb-6 sm:mb-10 md:mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-baseline gap-3 sm:gap-4">
        <h1 className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground">
          Collection
        </h1>
        <div className="h-px flex-1 bg-border" />
        <motion.span
          key={count}
          className="font-serif text-xs sm:text-sm tabular-nums text-muted-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {count} {count === 1 ? "object" : "objects"}
        </motion.span>
      </div>
    </motion.div>
  );
}
