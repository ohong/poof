"use client"

import Image from "next/image"
import { InventoryObject } from "@/types"

interface ObjectGridProps {
  objects: InventoryObject[]
  onObjectClick: (object: InventoryObject) => void
  animatingId?: string | null
}

export function ObjectGrid({ objects, onObjectClick, animatingId }: ObjectGridProps) {
  // Determine column count based on object count
  const getGridCols = (count: number) => {
    if (count <= 12) return "grid-cols-3 sm:grid-cols-4"
    if (count <= 36) return "grid-cols-4 sm:grid-cols-5 md:grid-cols-6"
    return "grid-cols-5 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8"
  }

  if (objects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-24 h-24 rounded-full bg-[#F0EDE8] flex items-center justify-center mb-6">
          <svg
            className="w-12 h-12 text-[#8B8680]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="font-headline text-xl text-[#1A1A1A] mb-2">
          Your gallery is empty
        </h3>
        <p className="font-body text-[#8B8680] max-w-sm">
          Upload photos of your belongings to transform them into a
          museum-quality inventory.
        </p>
      </div>
    )
  }

  return (
    <div className={`grid ${getGridCols(objects.length)} gap-1`}>
      {objects.map((object) => (
        <button
          key={object.id}
          onClick={() => onObjectClick(object)}
          disabled={animatingId === object.id}
          className={`
            aspect-square relative overflow-hidden bg-[#F0EDE8] rounded-sm
            transition-all duration-200 hover:brightness-95 hover:scale-[1.02]
            focus:outline-none focus:ring-2 focus:ring-[#C45D3A] focus:ring-offset-2
            ${animatingId === object.id ? "opacity-0" : ""}
          `}
        >
          <Image
            src={object.transformed_image_url || object.original_image_url}
            alt={object.description || "Object"}
            fill
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 12vw"
            className="object-cover"
          />
        </button>
      ))}
    </div>
  )
}
