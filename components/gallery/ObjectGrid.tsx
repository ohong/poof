"use client";

import { ObjectItem } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

interface ObjectGridProps {
  objects: ObjectItem[];
  onObjectClick: (id: string) => void;
  poofingIds?: Set<string>;
}

// Returns responsive column classes based on object count
function getGridClasses(objectCount: number): string {
  if (objectCount <= 12) {
    // 4 cols max: 2 on mobile, 3 on sm, 4 on md+
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  }
  if (objectCount <= 36) {
    // 6 cols max: 2 on mobile, 3 on sm, 4 on md, 6 on lg+
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6";
  }
  // 8 cols max: 3 on mobile, 4 on sm, 6 on md, 8 on lg+
  return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8";
}

export function ObjectGrid({
  objects,
  onObjectClick,
  poofingIds = new Set(),
}: ObjectGridProps) {
  const gridClasses = getGridClasses(objects.length);

  return (
    <motion.div
      className={cn("grid gap-[3px] bg-border p-[3px]", gridClasses)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      {objects.map((object, index) => (
        <motion.button
          key={object.id}
          onClick={() => onObjectClick(object.id)}
          className={cn(
            "group relative aspect-square w-full overflow-hidden bg-background",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2",
            poofingIds.has(object.id) && "pointer-events-none"
          )}
          initial={{ opacity: 0 }}
          animate={{
            opacity: poofingIds.has(object.id) ? 0 : 1,
            scale: poofingIds.has(object.id) ? 0.8 : 1,
          }}
          transition={{
            duration: 0.5,
            delay: poofingIds.has(object.id) ? 0 : index * 0.02,
            ease: [0.16, 1, 0.3, 1],
          }}
          aria-label={`View: ${object.description.slice(0, 50)}...`}
        >
          {/* Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={object.transformedImageUrl || object.originalImageUrl}
            alt=""
            className="h-full w-full object-cover transition-all duration-500 ease-out group-hover:scale-105"
          />

          {/* Hover overlay - subtle darkening */}
          <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/10" />

          {/* Corner indicator on hover */}
          <div className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-white opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100" />
        </motion.button>
      ))}
    </motion.div>
  );
}
