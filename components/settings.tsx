"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Download } from "lucide-react";
import { api } from "@/lib/api-client";
import { createClient } from "@/lib/supabase/client";
export function Settings({ email }: { email: string }) {
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function signOut() {
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signOut();
    if (error) {
      setError("Could not sign out. Please try again.");
      setBusy(false);
    } else {
      router.replace("/");
      router.refresh();
    }
  }
  async function removeAccount(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/account", {
        method: "DELETE",
        body: JSON.stringify({ confirmation }),
      });
      await createClient().auth.signOut({ scope: "local" });
      router.replace("/");
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not remove the account. Please retry.",
      );
      setBusy(false);
    }
  }
  return (
    <div className="settings-page">
      <h1>Your account.</h1>
      <div className="settings-row">
        <div>
          <h2>Signed in as</h2>
          <p>{email}</p>
        </div>
        <button className="button outline" disabled={busy} onClick={signOut}>
          <LogOut size={17} />
          {busy ? "Signing out…" : "Sign out"}
        </button>
      </div>
      <div className="settings-row">
        <div>
          <h2>A copy of your collection</h2>
          <p>
            Download object details, decisions, and sale drafts as JSON. Photos
            are available from each object.
          </p>
        </div>
        <a className="button outline" href="/api/export" download>
          <Download size={17} />
          Export inventory
        </a>
      </div>
      <div className="settings-row">
        <div>
          <h2>Free, with room to grow</h2>
          <p>
            Up to 1,000 objects per account. AI processing has daily limits to
            keep the service free. Your saved photos remain available when a
            limit is reached.
          </p>
        </div>
      </div>
      <details className="remove-account">
        <summary>Delete account and collection</summary>
        <p>
          This permanently removes your photos, objects, and account. Export
          anything you want to keep first.
        </p>
        <form onSubmit={removeAccount}>
          <label>
            Type DELETE to confirm
            <input
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              autoComplete="off"
            />
          </label>
          <button
            className="button outline danger"
            disabled={busy || confirmation !== "DELETE"}
          >
            Permanently delete account
          </button>
        </form>
      </details>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </div>
  );
}
