import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { PhotoComparison } from "@/components/photo-comparison";
import { sampleItems } from "@/lib/sample";
import { ItemImage } from "@/components/item-image";
import { previewMode, startHref } from "@/lib/experience";
export default function Page() {
  return (
    <div className="landing">
      <header className="site-header">
        <div className="brand-group">
          <Brand />
          {previewMode && <span className="preview-label">Preview</span>}
        </div>
        <nav>
          <Link href="/demo">Explore a collection</Link>
          <Link className="button outline compact" href={startHref}>
            {previewMode ? "Try Poof" : "Sign in"}
            <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="landing-hero">
          <div className="hero-copy">
            <h1>
              See everything
              <br />
              you own.
              <br />
              <em>Then let it go.</em>
            </h1>
            <p>
              Turn a few phone photos into a beautiful collection of your
              belongings. Keep what matters. Give the rest a next chapter.
            </p>
            <div className="hero-actions">
              <Link href={startHref} className="button primary">
                {previewMode
                  ? "Explore the collection"
                  : "Start your collection"}
                <ArrowRight size={18} />
              </Link>
              <span>
                {previewMode
                  ? "An interactive preview. No account needed."
                  : "Free to use. Your collection stays private."}
              </span>
            </div>
            {!previewMode && (
              <Link className="hero-demo" href="/demo">
                Take a look around first
                <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
          <Link
            href="/demo"
            className="hero-collection"
            aria-label="Explore the sample collection"
          >
            <div className="hero-gallery">
              {sampleItems.map((item, index) => (
                <div key={item.id}>
                  <ItemImage
                    item={item}
                    eager={index < 3}
                    sizes="(max-width: 640px) 30vw, 16vw"
                  />
                </div>
              ))}
            </div>
            <div className="hero-collection-caption">
              <span>A sample collection</span>
              <span>
                9 objects <ArrowUpRight size={16} />
              </span>
            </div>
          </Link>
        </section>
        <section className="landing-process">
          <div>
            <h2>A photo. A fresh perspective.</h2>
            <p>
              Snap one object at a time. We clean up the background and give
              each belonging a place in your private collection.
            </p>
          </div>
          <div>
            <h2>Keep the things that matter.</h2>
            <p>
              See your belongings together. Keep, sell, donate, or toss. Change
              your mind whenever you need to.
            </p>
          </div>
          <div>
            <h2>A little help with the next step.</h2>
            <p>
              Get an editable sale draft and a suggested price range. Copy,
              share, and give something a new home.
            </p>
          </div>
        </section>
        <section className="landing-transformation">
          <PhotoComparison />
          <div>
            <h2>
              Even the little
              <br />
              imperfections
              <br />
              <em>have a story.</em>
            </h2>
            <p>
              The mug you reach for every morning. The chip on its rim. A
              collection of your things should still look like your things.
            </p>
            <p>
              Poof keeps your original photo alongside the catalog image. Check
              both, edit the details, and make the decision yourself.
            </p>
            <Link className="text-button" href={startHref}>
              {previewMode ? "Take a closer look" : "Start with one object"}
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section className="landing-close">
          <h2>One thing is a start.</h2>
          <Link href={startHref} className="button primary">
            {previewMode ? "Try the preview" : "Make a little space"}
            <ArrowRight size={18} />
          </Link>
          <p>
            {previewMode
              ? "Browse, edit a sale draft, and try a decision. Changes stay in your tab."
              : "Free to use. No marketplace accounts needed."}
          </p>
        </section>
      </main>
      <footer className="site-footer">
        <Brand />
        <p>Inspired by the art of seeing what we own.</p>
        <Link href="/privacy">Privacy & data</Link>
      </footer>
    </div>
  );
}
