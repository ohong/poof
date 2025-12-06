export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 animate-pulse rounded-full bg-foreground"
              style={{
                animationDelay: `${i * 150}ms`,
              }}
            />
          ))}
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Loading
        </p>
      </div>
    </div>
  );
}
