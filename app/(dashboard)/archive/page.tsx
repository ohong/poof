"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { InventoryObject } from "@/types"

export default function ArchivePage() {
  const { user } = useUser()
  const [objects, setObjects] = useState<InventoryObject[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "sold" | "donated" | "tossed">("all")

  useEffect(() => {
    async function fetchArchive() {
      try {
        const response = await fetch("/api/objects/archive")
        if (response.ok) {
          const data = await response.json()
          setObjects(data.objects || [])
        }
      } catch (error) {
        console.error("Failed to fetch archive:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchArchive()
    }
  }, [user])

  const filteredObjects =
    filter === "all"
      ? objects
      : objects.filter((o) => o.status === filter)

  const getBadgeStyles = (status: string) => {
    switch (status) {
      case "sold":
        return "bg-[#2D5A3D] text-white"
      case "donated":
        return "bg-[#3D5A7C] text-white"
      case "tossed":
        return "bg-[#C45D3A] text-white"
      default:
        return "bg-[#8B8680] text-white"
    }
  }

  const parseDescription = (desc: string | null) => {
    if (!desc) return { name: "Untitled", description: "" }
    const colonIndex = desc.indexOf(":")
    if (colonIndex > 0 && colonIndex < 50) {
      return {
        name: desc.substring(0, colonIndex).trim(),
        description: desc.substring(colonIndex + 1).trim(),
      }
    }
    return { name: "Object", description: desc }
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
      {/* Header */}
      <div className="text-center">
        <h1 className="font-headline text-4xl md:text-5xl text-[#1A1A1A]">
          Archive
        </h1>
        <p className="font-body text-[#8B8680] mt-2">
          {objects.length} {objects.length === 1 ? "object" : "objects"} you&apos;ve let go
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center gap-2">
        {(["all", "sold", "donated", "tossed"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`
              font-body text-sm px-4 py-2 rounded-full transition-colors capitalize
              ${
                filter === tab
                  ? "bg-[#1A1A1A] text-[#FAF8F5]"
                  : "text-[#8B8680] hover:text-[#1A1A1A] hover:bg-[#F0EDE8]"
              }
            `}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {filteredObjects.length === 0 && (
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
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
          <h3 className="font-headline text-xl text-[#1A1A1A] mb-2">
            Nothing here yet
          </h3>
          <p className="font-body text-[#8B8680] max-w-sm">
            Poof! some objects from your gallery to see them here.
          </p>
        </div>
      )}

      {/* Archive Grid */}
      {filteredObjects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredObjects.map((object) => {
            const { name, description } = parseDescription(object.description)
            return (
              <div
                key={object.id}
                className="bg-white rounded-xl border border-[#E5E2DD] overflow-hidden"
              >
                {/* Image */}
                <div className="relative aspect-square bg-[#F0EDE8]">
                  <Image
                    src={object.transformed_image_url || object.original_image_url}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`
                        font-body text-xs px-3 py-1 rounded-full capitalize
                        ${getBadgeStyles(object.status)}
                      `}
                    >
                      {object.status}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-headline text-lg text-[#1A1A1A]">
                    {name}
                  </h3>
                  {description && (
                    <p className="font-body text-sm text-[#8B8680] mt-1 line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
