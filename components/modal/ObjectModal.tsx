"use client"

import Image from "next/image"
import { InventoryObject, ObjectStatus } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ObjectModalProps {
  object: InventoryObject | null
  isOpen: boolean
  onClose: () => void
  onAction: (action: ObjectStatus) => void
  isLoading?: boolean
}

export function ObjectModal({
  object,
  isOpen,
  onClose,
  onAction,
  isLoading,
}: ObjectModalProps) {
  if (!object) return null

  const imageUrl = object.transformed_image_url || object.original_image_url

  // Parse description to extract object name and description
  const parseDescription = (desc: string | null) => {
    if (!desc) return { name: "Untitled Object", description: "No description available." }
    const colonIndex = desc.indexOf(":")
    if (colonIndex > 0 && colonIndex < 50) {
      return {
        name: desc.substring(0, colonIndex).trim(),
        description: desc.substring(colonIndex + 1).trim(),
      }
    }
    return { name: "Object", description: desc }
  }

  const { name, description } = parseDescription(object.description)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl bg-white border-[#E5E2DD]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-[#1A1A1A]">
            {name}
          </DialogTitle>
        </DialogHeader>

        {/* Image */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#F0EDE8]">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, 576px"
            className="object-cover"
            priority
          />
        </div>

        {/* Description */}
        <p className="font-description text-lg text-[#1A1A1A] leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onAction("active")}
            disabled={isLoading}
            className="flex-1 font-body border-[#E5E2DD] text-[#8B8680] hover:bg-[#F0EDE8]"
          >
            Keep
          </Button>
          <Button
            onClick={() => onAction("sold")}
            disabled={isLoading}
            className="flex-1 font-body bg-[#2D5A3D] hover:bg-[#234A31] text-white"
          >
            Sell
          </Button>
          <Button
            onClick={() => onAction("donated")}
            disabled={isLoading}
            className="flex-1 font-body bg-[#3D5A7C] hover:bg-[#2E4A68] text-white"
          >
            Donate
          </Button>
          <Button
            onClick={() => onAction("tossed")}
            disabled={isLoading}
            className="flex-1 font-body bg-[#C45D3A] hover:bg-[#A84D2E] text-white"
          >
            Toss
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
