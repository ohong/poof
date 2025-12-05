"use client";

import { useGalleryStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const statusColors = {
  sold: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  donated: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  tossed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusLabels = {
  sold: "Sold",
  donated: "Donated",
  tossed: "Tossed",
};

export default function ArchivePage() {
  const archivedObjects = useGalleryStore((state) =>
    state.objects.filter((obj) => obj.status !== "active")
  );

  if (archivedObjects.length === 0) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Archive
        </h1>
        <p className="mt-4 text-muted-foreground">
          Nothing here yet. Poof! some objects to see them here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold tracking-tight md:text-3xl">
        Archive
        <span className="ml-2 text-muted-foreground">
          ({archivedObjects.length})
        </span>
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {archivedObjects.map((object) => (
          <div
            key={object.id}
            className="flex gap-4 rounded-lg border border-border p-4"
          >
            {/* Color thumbnail */}
            <div
              className="h-16 w-16 flex-shrink-0 rounded-md"
              style={{ backgroundColor: object.color }}
            />

            {/* Content */}
            <div className="flex flex-1 flex-col">
              <p className="line-clamp-2 font-serif text-sm leading-relaxed">
                {object.description}
              </p>
              <div className="mt-auto pt-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                    statusColors[object.status as keyof typeof statusColors]
                  )}
                >
                  {statusLabels[object.status as keyof typeof statusLabels]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
