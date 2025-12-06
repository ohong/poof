import type { Metadata } from "next";
import { Libre_Baskerville, Archivo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

// Editorial serif for museum labels and descriptions
const libreBaskerville = Libre_Baskerville({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
});

// Clean geometric sans for UI - rational, Swiss-inspired
const archivo = Archivo({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Poof! — See Everything You Own",
  description:
    "Transform your belongings into a museum-quality visual inventory. Upload photos, get AI-curated descriptions, and decide what to keep.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${archivo.variable} ${libreBaskerville.variable} font-sans antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
