"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="error-screen">
      <h1>A little interruption.</h1>
      <p>Something did not load. Your saved collection is still there.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
