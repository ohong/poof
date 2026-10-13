"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
export function AuthForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const client = createClient();
      const result = sent
        ? await client.auth.verifyOtp({ email, token: code, type: "email" })
        : await client.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: true },
          });
      if (result.error) throw result.error;
      if (sent) {
        router.replace("/gallery");
        router.refresh();
      } else setSent(true);
    } catch {
      setError(
        sent
          ? "That code is invalid or expired. Check your email, or request a new code."
          : "We could not send a code. Check your email address and try again shortly.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="auth-form">
      <div className="eyebrow">YOUR PRIVATE COLLECTION</div>
      <h1>{sent ? "Check your inbox." : "Make room for\na little lighter."}</h1>
      <p>
        {sent
          ? `We sent a sign-in code to ${email}. Enter it below.`
          : "Start your collection or pick up where you left off. One email. No password to remember."}
      </p>
      {sent ? (
        <label>
          Sign-in code
          <input
            autoFocus
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            minLength={6}
            required
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="code-input"
          />
        </label>
      ) : (
        <label>
          Email address
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value.trim())}
            placeholder="you@example.com"
          />
        </label>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button
        className="button primary"
        disabled={busy || (sent && code.length !== 6)}
      >
        {busy
          ? "One moment…"
          : sent
            ? "Open my collection"
            : "Continue with email"}
        <ArrowRight size={18} />
      </button>
      {sent && (
        <button
          className="text-button"
          type="button"
          disabled={busy}
          onClick={() => {
            setSent(false);
            setCode("");
            setError("");
          }}
        >
          <ArrowLeft size={16} />
          Use another email or request a new code
        </button>
      )}
      <small>Free to use. Your collection stays private.</small>
    </form>
  );
}
