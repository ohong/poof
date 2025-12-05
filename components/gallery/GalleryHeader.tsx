interface GalleryHeaderProps {
  count: number;
}

export function GalleryHeader({ count }: GalleryHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        You own{" "}
        <span className="tabular-nums">{count}</span>{" "}
        {count === 1 ? "object" : "objects"}
      </h1>
    </div>
  );
}
