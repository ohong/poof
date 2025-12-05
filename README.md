```markdown
# Poof!

**See everything you own. Then let it go.**

Poof! transforms messy phone photos of your belongings into a museum-quality visual inventory, making it effortless to decide what to keep, sell, donate, or toss.

---

## The Problem

Everything we own owns a part of us. Many people feel the urge to live simpler—fewer possessions, less mental clutter. Marie Kondo's first step: see all your belongings in one place. But actually doing this? Impractical.

Artist Barbara Iweins spent *two years* photographing all 10,532 objects in her house for her project [Katalog](https://katalog-barbaraiweins.com/). The result is stunning—a complete visual record of a life's accumulation. But who has two years and a professional photo setup?

Until now, that barrier made the "see everything you own" dream impossible for regular people.

## The Solution

Poof! uses generative AI to compress Barbara Iweins' two-year project into an afternoon.

**How it works:**

1. Snap photos of your stuff with your phone
2. Upload to Poof! (up to 10 at a time)
3. AI transforms each photo into a clean, professional product shot
4. AI writes a curatorial description for each object
5. Browse your belongings in a beautiful gallery view
6. Decide: Keep, Sell, Donate, or Toss
7. Watch items disappear with a satisfying "Poof!" animation

What remains is clarity. A visual inventory of what you've chosen to keep—and a record of what you've let go.

## Who It's For

- **Aspiring minimalists** who want to see everything they own but never had the means
- **People doing a "life reset"** or spring cleaning who need activation energy
- **Anyone inspired by Marie Kondo** who wants to go deeper than tidying drawers
- **The anti-overconsumption crowd** seeking a more grounded relationship with their stuff

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14, TypeScript |
| Styling | TailwindCSS, Shadcn UI |
| Animation | Motion |
| Auth | Clerk |
| Database & Storage | Supabase |
| Hosting & Deployment | Vercel |
| Image Transformation | FLUX.2 Image Editing |
| Object Descriptions | Claude 4.5 Sonnet |

## Powered by Kiro

This project was built with [Kiro](https://kiro.dev/), Amazon's agentic AI development environment. Kiro accelerated our build from concept to working product, enabling rapid prototyping across the full stack—from UI components to API integrations to the end-to-end AI pipeline.

## Future Roadmap

- **Semantic search** — Find objects by color, category, or natural language ("kitchen tools", "things I haven't used in a year")
- **One-click listing** — Post to FB Marketplace, Craigslist, or Karrot with AI-generated descriptions and suggested prices
- **AI negotiation** — Let an agent handle buyer messages and schedule pickups
- **Instant garage sale** — Spin up a custom storefront with payment integration

## Inspiration

[Katalog by Barbara Iweins](https://katalog-barbaraiweins.com/) — a two-year photographic inventory of 10,532 household objects. Poof! makes this possible for everyone.

---

*Because the first step to owning less is seeing what you own.*
```