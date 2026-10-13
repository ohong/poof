import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Brand } from "@/components/brand";
import { PhotoComparison } from "@/components/photo-comparison";
import { sampleItems } from "@/lib/sample";
import { ItemImage } from "@/components/item-image";
export default function Page() {
  return (
    <div className="landing">
      <header className="site-header">
        <Brand />
        <nav>
          <Link href="/demo">Explore a collection</Link>
          <Link className="button outline compact" href="/sign-in">
            Sign in
            <ArrowUpRight size={15} />
          </Link>
        </nav>
      </header>
      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <div className="eyebrow">LESS STUFF. MORE SPACE.</div>
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
              <Link href="/sign-in" className="button primary">
                Start your collection
                <ArrowRight size={18} />
              </Link>
              <span>Free. Private. A little lighter.</span>
            </div>
            <Link className="hero-demo" href="/demo">
              Take a look around first
              <ArrowUpRight size={15} />
            </Link>
          </div>
          <Link
            href="/demo"
            className="hero-collection"
            aria-label="Explore the sample collection"
          >
            <div className="hero-gallery">
              {sampleItems.map((item) => (
                <div key={item.id}>
                  <ItemImage item={item} />
                </div>
              ))}
            </div>
            <div className="hero-collection-caption">
              <span>THE EVERYDAY COLLECTION</span>
              <span>
                009 OBJECTS <ArrowUpRight size={15} />
              </span>
            </div>
          </Link>
        </section>
        <section className="landing-process">
          <div>
            <span>01 / SEE IT</span>
            <h2>A photo. A fresh perspective.</h2>
            <p>
              Snap one object at a time. We clean up the background and give
              each belonging a place in your private collection.
            </p>
          </div>
          <div>
            <span>02 / CHOOSE IT</span>
            <h2>Keep the things that matter.</h2>
            <p>
              See your belongings together. Keep, sell, donate, or toss. Change
              your mind whenever you need to.
            </p>
          </div>
          <div>
            <span>03 / RELEASE IT</span>
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
            <div className="eyebrow">A NEW BACKGROUND. THE SAME BELONGING.</div>
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
            <Link className="text-button" href="/sign-in">
              Start with one object
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
        <section className="landing-close">
          <span className="eyebrow">YOU DON’T HAVE TO DO IT ALL TODAY.</span>
          <h2>One thing is a start.</h2>
          <Link href="/sign-in" className="button primary">
            Make a little space
            <ArrowRight size={18} />
          </Link>
          <p>Free to use. No marketplace accounts needed.</p>
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
