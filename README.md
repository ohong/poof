# Poof!

**See everything you own. Then let it go.**

Poof turns phone photos into a private visual collection. See your belongings together, decide what to keep, and give the rest a next chapter.

The first step to owning less is seeing what you own.

The first release is free to use and works in desktop and mobile browsers:

- Add up to ten JPEG, PNG, WebP, or HEIC photos at once.
- Get a clean catalog image, a short description, and an editable sale draft.
- Review a labeled AI price range, set an asking price, and copy or share the draft.
- Keep, Sell, Donate, or Toss. Archive records the decision immediately; you can undo it.
- Edit details, download photos, export the collection, or permanently remove your data.

Listings are drafts. Poof does not post to marketplaces or complete sales. Compare catalog images with originals and review descriptions before posting. Price estimates do not use live sold-listing data.

## Current deployment

The public release is an interactive preview. Sample changes stay in the tab. Private accounts and uploads are deferred. A build without Supabase configuration selects this preview automatically. Resend is the selected email provider for the later account release.

## Run locally

Prerequisites: Node.js 22–26, npm, Docker, and Supabase CLI 2.118 or later. Local Supabase uses a dedicated `poof-rebuild` stack on ports 56321–56329. Other projects are not stopped or reset.

1. Run `npm ci`.
2. Run `npm run db:start`.
3. Run `npm run dev:setup` to create ignored local configuration.
4. Add `BFL_API_KEY` and `ANTHROPIC_API_KEY` to `.env.local`.
5. Run `npm run dev`.
6. Open [Poof locally](http://localhost:3000).

Sign-in codes appear in the [local email inbox](http://127.0.0.1:56324). This inbox does not deliver to real email addresses. Both confirmation and magic-link templates use the supplied code template.

The public `/demo` route contains illustrative sample objects. Changes there stay in the tab. It never substitutes for the real inventory.

## Verify

With the local stack and app running:

```sh
npm run verify
POOF_BASE_URL=http://localhost:3000 npm run verify:api
POOF_BASE_URL=http://localhost:3000 npm run verify:ai
POOF_BASE_URL=http://localhost:3000 node scripts/verify-maintenance.mjs
POOF_BASE_URL=http://localhost:3000 node scripts/verify-scaling.mjs
```

The API scripts refuse hosted projects. They create and remove disposable local accounts. `verify:ai` makes real paid BFL and Anthropic calls. Maintenance QA simulates elapsed time but uses real Storage operations. Scaling QA seeds 1,000 metadata records; it does not claim 1,000 real AI uploads.

## How it works

```text
phone photo → browser preparation → private Storage → saved object
                                                    ↓
                                            durable workflow
                                            /              \
                                     original → Claude   original → FLUX
                                            \              /
                                             private collection
                                                    ↓
                                         editable draft / decision
                                                    ↓
                                            reversible Archive
```

Next.js 16.4.5 handles the app and API. Supabase provides email-code accounts, Postgres, and private Storage. Vercel Workflow persists processing across interruptions. FLUX.2 Klein 9B edits images; Claude Haiku 5.5 describes the original and suggests a price range. The app builds the sale draft from those observations. Runtime calls use ordinary workflows, not autonomous agents.

Native Supabase accounts avoid a separate Clerk identity system. Hosted email delivery needs SMTP setup. See [release and operations](docs/release.md), [product specification](docs/specs.md), and [rebuild handoff](docs/pls-fix.md).

## Inspiration and history

Artist Barbara Iweins' [Katalog](https://katalog-barbaraiweins.com/) makes everyday possessions visible as a collection. Poof brings that idea to ordinary phone photos and practical decisions.

The original prototype was built with [Kiro](https://kiro.dev/). Its history and creator notes remain in Git. The current rebuild replaces that prototype with private storage, durable processing, reversible decisions, and complete sale-draft journeys.
