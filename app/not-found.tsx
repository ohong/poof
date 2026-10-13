import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-screen">
      <span className="brand">Poof✳</span>
      <h1>This page has disappeared.</h1>
      <p>Let’s get you back to your collection.</p>
      <Link href="/gallery" className="button primary">
        Back to collection
      </Link>
    </main>
  );
}
