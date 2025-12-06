"use client";

import { useCallback, useEffect } from "react";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { ObjectGrid } from "@/components/gallery/ObjectGrid";
import { ObjectModal } from "@/components/modal/ObjectModal";
import { useGalleryStore } from "@/lib/store";
import { PoofAction, ObjectStatus } from "@/types";
import { motion } from "motion/react";
import Link from "next/link";

const actionToStatus: Record<Exclude<PoofAction, "keep">, ObjectStatus> = {
  sell: "sold",
  donate: "donated",
  toss: "tossed",
};

export default function GalleryPage() {
  const objects = useGalleryStore((state) => state.objects);
  const isLoading = useGalleryStore((state) => state.isLoading);
  const error = useGalleryStore((state) => state.error);
  const selectedObjectId = useGalleryStore((state) => state.selectedObjectId);
  const poofingIds = useGalleryStore((state) => state.poofingIds);
  const selectObject = useGalleryStore((state) => state.selectObject);
  const updateObjectStatus = useGalleryStore(
    (state) => state.updateObjectStatus
  );
  const startPoofing = useGalleryStore((state) => state.startPoofing);
  const finishPoofing = useGalleryStore((state) => state.finishPoofing);
  const fetchObjects = useGalleryStore((state) => state.fetchObjects);

  // Fetch objects on mount
  useEffect(() => {
    fetchObjects();
  }, [fetchObjects]);

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  const handleObjectClick = useCallback(
    (id: string) => {
      selectObject(id);
    },
    [selectObject]
  );

  const handleModalAction = useCallback(
    async (action: PoofAction) => {
      if (!selectedObjectId) return;

      if (action === "keep") {
        selectObject(null);
        return;
      }

      const objectId = selectedObjectId;

      // Start poof animation
      selectObject(null);
      startPoofing(objectId);

      // After animation, update status via API
      setTimeout(async () => {
        const success = await updateObjectStatus(objectId, actionToStatus[action]);
        finishPoofing(objectId);

        if (!success) {
          // Refetch to restore state on error
          fetchObjects();
        }
      }, 800);
    },
    [
      selectedObjectId,
      selectObject,
      startPoofing,
      updateObjectStatus,
      finishPoofing,
      fetchObjects,
    ]
  );

  const handleModalClose = useCallback(() => {
    selectObject(null);
  }, [selectObject]);

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
            Loading collection...
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
            onClick={() => fetchObjects()}
            className="mt-8 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-medium tracking-wide transition-all hover:gap-3"
          >
            Try again
          </button>
        </motion.div>
      </div>
    );
  }

  // Empty state
  if (objects.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Collection Empty
          </h1>
          <p className="mt-6 max-w-sm font-serif text-base leading-relaxed text-muted-foreground">
            You&apos;ve released everything. Your archive holds what you&apos;ve
            let go.
          </p>
          <Link
            href="/gallery/archive"
            className="mt-8 inline-flex items-center gap-2 border-b border-foreground pb-1 text-sm font-medium tracking-wide transition-all hover:gap-3"
          >
            <span>View archive</span>
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div>
      <GalleryHeader count={objects.length} />

      <ObjectGrid
        objects={objects}
        onObjectClick={handleObjectClick}
        poofingIds={poofingIds}
      />

      <ObjectModal
        object={selectedObject ?? null}
        isOpen={!!selectedObjectId && !poofingIds.has(selectedObjectId)}
        onClose={handleModalClose}
        onAction={handleModalAction}
      />
    </div>
  );
}
