"use client";

import { useCallback } from "react";
import { GalleryHeader } from "@/components/gallery/GalleryHeader";
import { ObjectGrid } from "@/components/gallery/ObjectGrid";
import { ObjectModal } from "@/components/modal/ObjectModal";
import { useGalleryStore } from "@/lib/store";
import { PoofAction, ObjectStatus } from "@/types";

const actionToStatus: Record<Exclude<PoofAction, "keep">, ObjectStatus> = {
  sell: "sold",
  donate: "donated",
  toss: "tossed",
};

export default function GalleryPage() {
  const objects = useGalleryStore((state) => state.objects);
  const selectedObjectId = useGalleryStore((state) => state.selectedObjectId);
  const poofingIds = useGalleryStore((state) => state.poofingIds);
  const selectObject = useGalleryStore((state) => state.selectObject);
  const updateObjectStatus = useGalleryStore(
    (state) => state.updateObjectStatus
  );
  const startPoofing = useGalleryStore((state) => state.startPoofing);
  const finishPoofing = useGalleryStore((state) => state.finishPoofing);

  const activeObjects = objects.filter((obj) => obj.status === "active");
  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  const handleObjectClick = useCallback(
    (id: string) => {
      selectObject(id);
    },
    [selectObject]
  );

  const handleModalAction = useCallback(
    (action: PoofAction) => {
      if (!selectedObjectId) return;

      if (action === "keep") {
        selectObject(null);
        return;
      }

      // Start poof animation
      selectObject(null);
      startPoofing(selectedObjectId);

      // After animation, update status
      setTimeout(() => {
        updateObjectStatus(selectedObjectId, actionToStatus[action]);
        finishPoofing(selectedObjectId);
      }, 800);
    },
    [
      selectedObjectId,
      selectObject,
      startPoofing,
      updateObjectStatus,
      finishPoofing,
    ]
  );

  const handleModalClose = useCallback(() => {
    selectObject(null);
  }, [selectObject]);

  if (activeObjects.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Your Gallery
        </h1>
        <p className="mt-4 text-muted-foreground">
          You&apos;ve cleared everything! Check your archive to see what
          you&apos;ve let go.
        </p>
      </div>
    );
  }

  return (
    <div>
      <GalleryHeader count={activeObjects.length} />

      <ObjectGrid
        objects={activeObjects}
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
