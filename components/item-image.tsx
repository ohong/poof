"use client";
import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";
import type { GridItem } from "@/types";
export function ItemImage({
  item,
  original = false,
  eager = false,
  sizes = "(max-width: 640px) 46vw, (max-width: 900px) 30vw, 24vw",
}: {
  item: GridItem;
  original?: boolean;
  eager?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState<string | null>(null);
  const sample = item.sampleIndex !== undefined;
  const src = sample
    ? `/samples/object-${item.sampleIndex}.webp`
    : original
      ? item.original_url
      : item.image_url || item.original_url;
  return src && src !== failed ? (
    <Image
      src={src}
      alt={item.name}
      width={sample ? 418 : 800}
      height={sample ? 418 : 800}
      sizes={sizes}
      loading={eager ? "eager" : "lazy"}
      unoptimized={!sample}
      className={`object-photo${sample ? " sample-photo" : ""}`}
      onError={() => setFailed(src)}
    />
  ) : (
    <div className="photo-placeholder">
      <ImageOff size={22} aria-hidden="true" />
      {item.processing_state === "uploaded"
        ? "Photo uploading"
        : "Photo unavailable"}
    </div>
  );
}
