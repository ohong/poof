"use client";
import { useState } from "react";
import Image from "next/image";
export function PhotoComparison() {
  const [original, setOriginal] = useState(false);
  return (
    <div className="photo-comparison">
      <div className="comparison-photo">
        <Image
          src={
            original ? "/samples/mug-original.png" : "/samples/mug-catalog.jpg"
          }
          width={800}
          height={800}
          alt={
            original
              ? "Illustrative phone photo of a chipped blue mug on a kitchen table"
              : "The same chipped blue mug after Poof cleans up the background"
          }
        />
        <span>{original ? "THE PHOTO" : "THE CATALOG"}</span>
      </div>
      <div className="comparison-controls">
        <button aria-pressed={original} onClick={() => setOriginal(true)}>
          Original photo
        </button>
        <button aria-pressed={!original} onClick={() => setOriginal(false)}>
          Catalog photo
        </button>
      </div>
      <small>
        Illustrative input. Actual result from Poof’s image processing.
      </small>
    </div>
  );
}
