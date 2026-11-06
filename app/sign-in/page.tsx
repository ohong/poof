import { Brand } from "@/components/brand";
import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/config";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
export default async function SignIn() {
  if (configured()) {
    const db = await createClient();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (user) redirect("/gallery");
  }
  return (
    <div className="auth-page">
      <header className="site-header">
        <Brand />
        <Link className="text-button" href="/demo">
          Explore a sample collection
        </Link>
      </header>
      <main className="auth-layout" id="main-content" tabIndex={-1}>
        <div className="auth-visual">
          <div className="sample-sheet" />
          <p>
            A home full of things.
            <br />A little space to see them differently.
          </p>
        </div>
        {configured() ? (
          <AuthForm />
        ) : (
          <div className="auth-form">
            <h1>Take a look around.</h1>
            <p>
              Poof is open as an interactive preview. Private accounts and photo
              uploads are not enabled yet. Explore the sample collection to try
              editing, sale drafts, and reversible decisions.
            </p>
            <Link href="/demo" className="button">
              Explore the sample collection
            </Link>
          </div>
        )}
      </main>
      <footer className="site-footer">
        <span>A little less, a little lighter.</span>
        <Link href="/privacy">Privacy & data</Link>
      </footer>
    </div>
  );
}
