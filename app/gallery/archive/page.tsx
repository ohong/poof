"use client";

import { useEffect } from "react";
import { useGalleryStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

const statusConfig = {
  sold: {
    label: "Sold",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  donated: {
    label: "Donated",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  tossed: {
    label: "Discarded",
    color: "text-stone-600",
    bg: "bg-stone-100",
    border: "border-stone-200",
  },
};

export default function ArchivePage() {
  const archivedObjects = useGalleryStore((state) => state.archivedObjects);
  const isLoading = useGalleryStore((state) => state.isArchiveLoading);
  const error = useGalleryStore((state) => state.error);
  const fetchArchivedObjects = useGalleryStore(
    (state) => state.fetchArchivedObjects
  );

  // Fetch archived objects on mount
  useEffect(() => {
    fetchArchivedObjects();
  }, [fetchArchivedObjects]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="mb-4 h-8 w-8 animate-pulse rounded-full bg-muted mx-auto" />
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Loading archive...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Error
          </h1>
          <p className="mt-6 max-w-sm font-serif text-base leading-relaxed text-muted-foreground">
            {error}
          </p>
          <button
            onClick={() => fetchArchivedObjects()}
            className="mt-8 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-medium tracking-wide transition-all hover:gap-3"
          >
            Try again
          </button>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (archivedObjects.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Archive
          </h1>
          <p className="mt-6 max-w-sm font-serif text-base leading-relaxed text-muted-foreground">
            Objects you release will be preserved here. Return to your
            collection and let something go.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        className="mb-6 sm:mb-10 md:mb-16"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-baseline gap-3 sm:gap-4">
          <h1 className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] sm:tracking-[0.2em] text-muted-foreground">
            Archive
          </h1>
          <div className="h-px flex-1 bg-border" />
          <span className="font-serif text-xs sm:text-sm tabular-nums text-muted-foreground">
            {archivedObjects.length} released
          </span>
        </div>
      </motion.div>

      {/* Archive Grid - catalog style */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {archivedObjects.map((object, index) => {
          const status =
            statusConfig[object.status as keyof typeof statusConfig];

          return (
            <motion.article
              key={object.id}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={object.transformedImageUrl || object.originalImageUrl}
                  alt=""
                  className="h-full w-full object-cover opacity-75 grayscale transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
                />
              </div>

              {/* Label */}
              <div className="mt-3 space-y-2">
                <p className="line-clamp-2 font-serif text-sm leading-relaxed text-foreground">
                  {object.description}
                </p>

                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 text-xs font-medium tracking-wide",
                      status?.bg,
                      status?.color,
                      "border",
                      status?.border
                    )}
                  >
                    {status?.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(object.updatedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
