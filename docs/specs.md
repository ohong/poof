# Poof! — Product Specification

## Problem

People want to own less but lack visibility into what they actually have. Marie Kondo's first step—seeing all your possessions in one place—is impractical for most people. Barbara Iweins spent two years photographing 10,532 objects. Poof! compresses that into an afternoon with generative AI.

## Solution

A web app that transforms phone photos of belongings into a museum-quality visual inventory. Users upload messy snapshots; AI returns professional product shots on clean backgrounds with curatorial descriptions. The gallery makes decision-making (keep/sell/donate/toss) visual and satisfying.

## Target User

Aspiring minimalists who've never inventoried their possessions because activation energy was too high. People inspired by Marie Kondo, decluttering content, and anti-consumerism culture.

---

## Core User Flow

1. **Landing page** — Bold, editorial design (reference: trysaru.com). Communicates value prop in <5 seconds. Single CTA to sign up.

2. **Authentication** — Clerk handles signup/login.

3. **Upload** — User selects 1-10 images from desktop (sourced via AirDrop from phone). Drag-and-drop or file picker.

4. **Processing pipeline** (runs in parallel per image):
   - FLUX.2 transforms original photo → square, clean-background product shot
   - Claude 4.5 Sonnet generates MOMA-style description from original image
   - On FLUX failure: fall back to original photo, continue with description
   - Store both images (original + transformed) and description in Supabase

5. **Gallery view** — Responsive grid of square thumbnails. Cell size shrinks as object count grows (à la Iweins). Header displays live count: "You own 47 objects."

6. **Object detail modal** — Click thumbnail → centered modal over gallery. Shows:
   - Large transformed image
   - AI-generated description
   - Four action buttons: Keep / Sell / Donate / Toss

7. **Poof! action** — Selecting Sell, Donate, or Toss triggers:
   - Particle dissolve animation on the image
   - Object removed from main gallery
   - Live counter decrements
   - Object moves to Archive with its disposition tagged

8. **Archive page** — Secondary tab showing all Poof!ed objects. Filterable by disposition (Sold, Donated, Tossed). Read-only.

---

## Functional Requirements

### Upload & Processing
- Accept JPEG, PNG, HEIC up to 10 images per batch
- Show processing state per image (uploading → transforming → complete)
- Max ~20 seconds per image transformation acceptable
- Batch Claude vision calls (all images in single request where possible)
- Graceful degradation: if FLUX fails, use original image

### Gallery
- Grid layout: uniform square cells
- Responsive: 4-8 columns depending on viewport, cells shrink as count grows
- Infinite scroll or pagination for 50+ objects
- Live object count in header

### Object Modal
- Centered overlay, dismissible via click-outside or X
- Image, description, and 4 action buttons
- Keep = close modal, no change
- Sell/Donate/Toss = trigger animation, update DB, remove from gallery

### Animation
- Particle dissolve effect using Motion library
- Duration: ~800ms-1s
- Should feel satisfying, not jarring

### Archive
- Simple list or grid of Poof!ed items
- Show disposition tag (Sold/Donated/Tossed)
- No actions available (read-only history)

---

## Technical Architecture

| Layer | Technology |
|-------|------------|
| Frontend | Next.js, TypeScript, TailwindCSS, Shadcn UI |
| Animation | Motion |
| Auth | Clerk |
| Database | Supabase (Postgres) |
| Image Storage | Supabase Storage |
| Image Transform | FLUX.2 Image Editing API |
| Vision/Descriptions | Claude 4.5 Sonnet (batched) |

### Data Model (Supabase)

**objects**
- id, user_id, original_image_url, transformed_image_url, description, status (active/sold/donated/tossed), created_at, updated_at

---

## Out of Scope (v1)

- Semantic search (Meilisearch integration)
- Duplicate detection
- Mobile-native upload
- Edit/update object details
- Undo Poof! action

## Future Roadmap

- One-click list to FB Marketplace/Craigslist via browser agent
- AI negotiation agent for transactions
- Custom "garage sale" storefront generator
- Semantic search by color, category, room
- Duplicate/similar item detection

---

## Demo Strategy

**Pre-seed:** 50 objects in demo account so judges see populated gallery immediately.

**2-minute flow:**
1. Landing page (5s) — show design quality
2. Login → Gallery reveal (10s) — "wow" moment of density
3. Upload 1-2 new objects live (30s) — show processing pipeline
4. Click object → Poof! it (15s) — particle animation, counter decrement
5. Show Archive (10s) — Poof!ed items preserved
6. Discuss future roadmap (30s)

---

## Success Criteria

- Processing pipeline works end-to-end (upload → transform → describe → display)
- Gallery scales visually from 10 to 100+ objects
- Poof! animation delivers emotional payoff
- Demo completes without errors
- Judges understand "Frankenstein" angle: FLUX + Claude Vision + Supabase vectors (mention roadmap)