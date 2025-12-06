"use client";

import { useEffect } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GalleryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Gallery Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-md"
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
        </div>

        <h1 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Something went wrong
        </h1>

        <p className="mt-6 font-serif text-base leading-relaxed text-muted-foreground">
          We couldn&apos;t load your collection. This might be a temporary issue
          with our servers.
        </p>

        <Button
          onClick={reset}
          variant="outline"
          className="mt-8 gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </Button>

        {error.digest && (
          <p className="mt-6 font-mono text-xs text-muted-foreground/50">
            Error ID: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}
