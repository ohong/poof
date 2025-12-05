import type { Metadata } from "next"
import { Playfair_Display, DM_Sans, Lora } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
})

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Poof! — See Everything You Own",
  description: "Transform your belongings into a museum-quality visual inventory. Then let them go.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${playfair.variable} ${dmSans.variable} ${lora.variable} font-sans antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
