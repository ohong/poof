"use client";

import { ObjectItem } from "@/types";
import { cn } from "@/lib/utils";

interface ObjectGridProps {
  objects: ObjectItem[];
  onObjectClick: (id: string) => void;
  poofingIds?: Set<string>;
}

function getColumnCount(objectCount: number): number {
  if (objectCount <= 12) return 4;
  if (objectCount <= 36) return 6;
  return 8;
}

export function ObjectGrid({
  objects,
  onObjectClick,
  poofingIds = new Set(),
}: ObjectGridProps) {
  const columnCount = getColumnCount(objects.length);

  return (
    <div
      className="grid gap-1"
      style={{
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
      }}
    >
      {objects.map((object) => (
        <button
          key={object.id}
          onClick={() => onObjectClick(object.id)}
          className={cn(
            "aspect-square w-full transition-all duration-200",
            "hover:brightness-110 hover:scale-[1.02]",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            poofingIds.has(object.id) && "opacity-0 scale-50"
          )}
          style={{ backgroundColor: object.color }}
          aria-label={`View object: ${object.description.slice(0, 50)}...`}
        />
      ))}
    </div>
  );
}
