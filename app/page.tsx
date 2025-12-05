"use client"

import Link from "next/link"
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] relative overflow-hidden">
      {/* Noise texture overlay */}
      <div className="fixed inset-0 bg-noise" />

      {/* Gradient accent */}
      <div
        className="fixed top-0 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(circle at center, #C45D3A 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <Link href="/" className="font-headline text-2xl tracking-tight text-[#1A1A1A]">
          Poof!
        </Link>
        <div className="flex items-center gap-4">
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="font-body text-sm">
                Sign In
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <Link href="/gallery">
              <Button className="font-body text-sm bg-[#1A1A1A] hover:bg-[#333] text-[#FAF8F5]">
                Go to Gallery
              </Button>
            </Link>
          </SignedIn>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-120px)] px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Headline with staggered animation */}
          <h1
            className="font-headline text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight text-[#1A1A1A] opacity-0 animate-fade-in-up"
            style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
          >
            See everything
            <br />
            you own.
          </h1>

          <p
            className="font-headline text-4xl md:text-5xl lg:text-6xl text-[#C45D3A] mt-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "300ms", animationFillMode: "forwards" }}
          >
            Then let it go.
          </p>

          <p
            className="font-body text-lg md:text-xl text-[#8B8680] max-w-xl mx-auto mt-12 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "500ms", animationFillMode: "forwards" }}
          >
            Transform your phone photos into a museum-quality visual inventory.
            AI generates professional shots and curatorial descriptions.
            Make decisions. Declutter. Breathe.
          </p>

          <div
            className="mt-12 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "700ms", animationFillMode: "forwards" }}
          >
            <SignedOut>
              <SignUpButton mode="modal">
                <Button
                  size="lg"
                  className="font-body text-base px-8 py-6 bg-[#1A1A1A] hover:bg-[#333] text-[#FAF8F5] rounded-full transition-all hover:scale-105"
                >
                  Start Your Inventory
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/gallery">
                <Button
                  size="lg"
                  className="font-body text-base px-8 py-6 bg-[#1A1A1A] hover:bg-[#333] text-[#FAF8F5] rounded-full transition-all hover:scale-105"
                >
                  View Your Gallery
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>

        {/* Floating object count teaser */}
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in"
          style={{ animationDelay: "1000ms", animationFillMode: "forwards" }}
        >
          <p className="font-body text-sm text-[#8B8680] tracking-widest uppercase">
            Average user owns 10,532 objects
          </p>
        </div>
      </main>

      {/* Decorative elements */}
      <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#FAF8F5] to-transparent pointer-events-none" />
    </div>
  )
}
