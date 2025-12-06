import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        <p className="font-mono text-6xl font-bold text-muted-foreground/20">
          404
        </p>

        <h1 className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Page not found
        </h1>

        <p className="mt-6 font-serif text-base leading-relaxed text-muted-foreground">
          This page doesn&apos;t exist. It may have been moved, or perhaps it
          was never here at all.
        </p>

        <Button asChild variant="outline" className="mt-8 gap-2">
          <Link href="/gallery">
            <ArrowLeft className="h-4 w-4" />
            Back to collection
          </Link>
        </Button>
      </div>
    </div>
  );
}
