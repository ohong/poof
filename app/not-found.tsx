import Link from "next/link";
import { Brand } from "@/components/brand";
import { previewMode } from "@/lib/experience";
export default function NotFound() {
  return (
    <main className="error-screen" id="main-content" tabIndex={-1}>
      <Brand />
      <h1>This page has disappeared.</h1>
      <p>Let’s get you back to your collection.</p>
      <Link
        href={previewMode ? "/demo" : "/gallery"}
        className="button primary"
      >
        Back to collection
      </Link>
    </main>
  );
}
