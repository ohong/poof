"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="error-screen" id="main-content" tabIndex={-1}>
      <h1>A little interruption.</h1>
      <p>Something did not load. Please try again.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
