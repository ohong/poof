"use client"

interface GalleryHeaderProps {
  count: number
}

export function GalleryHeader({ count }: GalleryHeaderProps) {
  return (
    <div className="text-center mb-8">
      <h1 className="font-headline text-4xl md:text-5xl text-[#1A1A1A]">
        You own{" "}
        <span className="text-[#C45D3A] tabular-nums">{count}</span>{" "}
        {count === 1 ? "object" : "objects"}
      </h1>
      {count === 0 && (
        <p className="font-body text-[#8B8680] mt-4">
          Upload some photos to start your inventory
        </p>
      )}
    </div>
  )
}
