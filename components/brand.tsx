import Link from "next/link";
export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="Poof home">
      Poof<span aria-hidden="true">✳</span>
    </Link>
  );
}
