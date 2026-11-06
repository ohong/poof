import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { InputModality } from "@/components/input-modality";
const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000"),
  ),
  title: {
    default: "Poof | Sort your belongings",
    template: "%s · Poof!",
  },
  description:
    "See what you own. Turn photos into a private collection, make a plan, and let things go. Free to use.",
};
export const viewport: Viewport = {
  themeColor: "#f5f6f4",
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={sans.variable}>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <InputModality />
        {children}
      </body>
    </html>
  );
}
