import Link from "next/link";
import { Brand } from "@/components/brand";
import { PhotoComparison } from "@/components/photo-comparison";
import { sampleItems } from "@/lib/sample";
import { ItemImage } from "@/components/item-image";
import { previewMode, startHref } from "@/lib/experience";
export default function Page() {
  return (
    <div className="landing">
      <header className="site-header">
        <Brand />
        {previewMode ? <span className="preview-label">Product preview</span> : <Link href="/sign-in">Sign in</Link>}
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="landing-hero">
          <div className="hero-copy">
            <h1>Decide what stays</h1>
            <p>See your belongings together. Choose what to keep, sell, donate, or toss, and prepare a listing for anything you want to sell.</p>
            <div className="hero-actions">
              <Link href={startHref} className="button primary">{previewMode ? "Open sample collection" : "Start your collection"}</Link>
              <span>{previewMode ? "Sample objects. Edits reset when you reload." : "Free to use. Your collection stays private."}</span>
            </div>
          </div>
          <Link href="/demo" className="hero-collection" aria-label="Open the sample collection">
            <div className="hero-gallery">
              {sampleItems.slice(0, 6).map((item) => (
                <div key={item.id}>
                  <ItemImage item={item} eager sizes="(max-width: 640px) 44vw, 18vw" />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </Link>
        </section>
        <section className="landing-transformation">
          <PhotoComparison />
          <div>
            <h2>Check the photo before you list</h2>
            <p>Poof prepares a catalog image and keeps the original for comparison. Check that details such as the chip on this mug still appear.</p>
            <p>You can edit the description, set an asking price, and copy or share a sale draft. Suggested ranges are estimates, without live market research.</p>
            {previewMode && <p>Accounts and uploads are not available in this preview. The sample collection lets you try editing, sale drafts, and Archive decisions.</p>}
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <Brand />
        <Link href="/privacy">Privacy & data</Link>
      </footer>
    </div>
  );
}
