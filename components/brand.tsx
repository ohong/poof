import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Poof home">
      Poof
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        className="brand-mark"
      >
        <path d="M12 1v22M1 12h22M4.2 4.2l15.6 15.6M4.2 19.8L19.8 4.2" />
      </svg>
    </Link>
  );
}
