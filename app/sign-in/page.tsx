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
        <Link href="/demo">Explore a sample collection ↗</Link>
      </header>
      <main className="auth-layout">
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
            <h1>We’ll be back shortly.</h1>
            <p>
              Your collection is temporarily unavailable. Please try again
              later.
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
