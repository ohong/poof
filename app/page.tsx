import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 md:px-12 lg:px-16">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Poof!
        </Link>
        <Link href="/gallery">
          <Button variant="ghost" className="text-sm font-medium">
            Enter Gallery
          </Button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 md:px-12 lg:px-16">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl lg:text-7xl">
            See everything you own.
            <br />
            <span className="text-muted-foreground">Then let it go.</span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl font-serif text-lg leading-relaxed text-muted-foreground md:text-xl">
            Transform your belongings into a museum-quality visual inventory.
            Upload photos, get AI-curated descriptions, and decide what stays.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/gallery">
              <Button size="lg" className="h-12 px-8 text-base font-medium">
                Start Your Catalog
              </Button>
            </Link>
          </div>

          <p className="mt-16 text-sm text-muted-foreground">
            Inspired by Barbara Iweins&apos;s{" "}
            <span className="italic">Katalog</span> — 10,532 objects,
            photographed over two years.
            <br />
            We compress that into an afternoon.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-muted-foreground md:px-12 lg:px-16">
        <p>A digital catalog of everything you own</p>
      </footer>
    </div>
  );
}
