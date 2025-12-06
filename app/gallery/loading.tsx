export default function GalleryLoading() {
  // Default to 12 skeleton items (4 columns layout)
  const skeletonCount = 12;

  return (
    <div>
      {/* Header skeleton */}
      <div className="mb-8 sm:mb-12">
        <div className="h-3 w-32 animate-pulse rounded bg-muted" />
      </div>

      {/* Grid skeleton matching ObjectGrid layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-[3px] bg-border p-[3px]">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <div
            key={i}
            className="aspect-square w-full animate-pulse bg-muted"
            style={{
              animationDelay: `${i * 50}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
