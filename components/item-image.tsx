import Image from "next/image";
import type { GridItem } from "@/types";
export function ItemImage({
  item,
  original = false,
}: {
  item: GridItem;
  original?: boolean;
}) {
  if (item.sampleIndex !== undefined)
    return (
      <div
        role="img"
        aria-label={item.name}
        className="specimen-image"
        style={{
          backgroundPosition: `${(item.sampleIndex % 3) * 50}% ${Math.floor(item.sampleIndex / 3) * 50}%`,
        }}
      />
    );
  const src = original ? item.original_url : item.image_url;
  return src ? (
    <Image
      src={src}
      alt={item.name}
      width={800}
      height={800}
      unoptimized
      className="object-photo"
    />
  ) : (
    <div className="photo-placeholder">
      {item.processing_state === "uploaded"
        ? "Photo uploading"
        : "Photo unavailable"}
    </div>
  );
}
