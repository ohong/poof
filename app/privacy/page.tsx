import Link from "next/link";
import { Brand } from "@/components/brand";
import { previewMode } from "@/lib/experience";
import { ArrowUpRight } from "lucide-react";
export default function Privacy() {
  return (
    <div className="policy-page">
      <header className="site-header">
        <Brand />
        <Link className="text-button" href={previewMode ? "/demo" : "/gallery"}>
          {previewMode ? "Explore the preview" : "Your collection"}{" "}
          <ArrowUpRight size={16} />
        </Link>
      </header>
      <main id="main-content" tabIndex={-1}>
        <h1>Privacy & data.</h1>
        {previewMode && (
          <p className="notice">
            This release is a product preview. It does not accept account
            sign-ups or photo uploads. Sample edits stay in your tab and reset
            when you reload. The sections below describe how private collections
            work when account services are enabled.
          </p>
        )}
        <p>
          Your collection belongs to your account. Object records and photos use
          account-based access rules. The sample collection is separate and does
          not save changes.
        </p>
        <h2>Photos and AI processing</h2>
        <p>
          Your browser resizes photos and converts them to JPEG before upload.
          The resized original is stored privately. Black Forest Labs (BFL)
          receives the photo to create a catalog image. Anthropic receives it to
          describe the object and suggest a sale price range. Processing follows
          those providers’ data policies.
        </p>
        <p>
          AI can change details, miss damage, or give an unsuitable price.
          Compare the catalog image with the original. Review and edit any sale
          draft before posting. Price ranges are general AI estimates; Poof does
          not check sold listings or provide appraisals.
        </p>
        <h2>Your decisions stay reversible</h2>
        <p>
          Sell, Donate, and Toss record an intention. They do not post a
          listing, transfer ownership, or confirm a completed sale or donation.
          You can restore any archived object to your collection.
        </p>
        <h2>Export and retention</h2>
        <p>
          You can export your object details and decisions from Account
          settings. You can download photos from each object. Archiving retains
          the object and its photos. It does not delete them. Object details and
          Account settings also provide permanent removal controls. Deleting an
          object removes its stored photos and record. Deleting your account
          removes the collection and sign-in access. Provider retention follows
          the policies linked below.
        </p>
        <h2>Account access</h2>
        <p>
          A one-time email code signs you in. Poof does not ask for a password.
          Sign out on shared devices.
        </p>
        <h2>Provider policies</h2>
        <p>
          <a href="https://supabase.com/privacy">Supabase</a> stores account
          data, object records, and photos.{" "}
          <a href="https://www.anthropic.com/legal/privacy">Anthropic</a>{" "}
          processes object descriptions.{" "}
          <a href="https://bfl.ai/privacy-policy">Black Forest Labs</a>{" "}
          processes images.
        </p>
        <p className="field-help">Last updated November 6, 2026.</p>
      </main>
      <footer className="site-footer">
        <Link href="/">Back to Poof</Link>
      </footer>
    </div>
  );
}
