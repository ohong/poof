"use client"

import { useState, useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { GalleryHeader } from "@/components/gallery/GalleryHeader"
import { ObjectGrid } from "@/components/gallery/ObjectGrid"
import { ObjectModal } from "@/components/modal/ObjectModal"
import { PoofAnimation } from "@/components/animation/PoofAnimation"
import { InventoryObject, ObjectStatus } from "@/types"

export default function GalleryPage() {
  const { user } = useUser()
  const [objects, setObjects] = useState<InventoryObject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedObject, setSelectedObject] = useState<InventoryObject | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [animatingObject, setAnimatingObject] = useState<InventoryObject | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // Track position for poof animation
  const gridRef = useRef<HTMLDivElement>(null)
  const [animationPosition, setAnimationPosition] = useState({ x: 0, y: 0, width: 0, height: 0 })

  // Fetch objects
  useEffect(() => {
    async function fetchObjects() {
      try {
        const response = await fetch("/api/objects")
        if (response.ok) {
          const data = await response.json()
          setObjects(data.objects || [])
        }
      } catch (error) {
        console.error("Failed to fetch objects:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchObjects()
    }
  }, [user])

  const handleObjectClick = (object: InventoryObject) => {
    setSelectedObject(object)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedObject(null)
  }

  const handleAction = async (action: ObjectStatus) => {
    if (!selectedObject) return

    // If "Keep", just close the modal
    if (action === "active") {
      handleModalClose()
      return
    }

    setIsActionLoading(true)

    try {
      // Update status in database
      const response = await fetch(`/api/objects/${selectedObject.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      })

      if (!response.ok) {
        throw new Error("Failed to update object")
      }

      // Close modal first
      setIsModalOpen(false)

      // Find the object's position in the grid for animation
      const objectIndex = objects.findIndex((o) => o.id === selectedObject.id)
      if (gridRef.current && objectIndex >= 0) {
        const gridItems = gridRef.current.querySelectorAll("button")
        const targetItem = gridItems[objectIndex]
        if (targetItem) {
          const rect = targetItem.getBoundingClientRect()
          const containerRect = gridRef.current.getBoundingClientRect()
          setAnimationPosition({
            x: rect.left - containerRect.left,
            y: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height,
          })
        }
      }

      // Trigger poof animation
      setAnimatingObject(selectedObject)
    } catch (error) {
      console.error("Action failed:", error)
    } finally {
      setIsActionLoading(false)
    }
  }

  const handlePoofComplete = () => {
    // Remove object from state after animation
    if (animatingObject) {
      setObjects((prev) => prev.filter((o) => o.id !== animatingObject.id))
    }
    setAnimatingObject(null)
    setSelectedObject(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse">
          <div className="w-12 h-12 rounded-full bg-[#F0EDE8]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header with count */}
      <GalleryHeader count={objects.length} />

      {/* Object Grid */}
      <div ref={gridRef} className="relative">
        <ObjectGrid
          objects={objects}
          onObjectClick={handleObjectClick}
          animatingId={animatingObject?.id}
        />

        {/* Poof Animation Overlay */}
        {animatingObject && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: animationPosition.x,
              top: animationPosition.y,
              width: animationPosition.width,
              height: animationPosition.height,
            }}
          >
            <PoofAnimation
              imageUrl={animatingObject.transformed_image_url || animatingObject.original_image_url}
              isAnimating={true}
              onComplete={handlePoofComplete}
              width={animationPosition.width}
              height={animationPosition.height}
            />
          </div>
        )}
      </div>

      {/* Object Detail Modal */}
      <ObjectModal
        object={selectedObject}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onAction={handleAction}
        isLoading={isActionLoading}
      />
    </div>
  )
}
