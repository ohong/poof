# Poof! — Project Plan

## Overview

**Team:** 2-3 engineers, dozens of AI coding agents working in parallel
**Goal:** Functional MVP with polished demo flow

---

## Workstream Assignments

| Engineer | Primary Domain |
|----------|----------------|
| **A** | Frontend UI (Landing, Gallery, Modal, Archive, Animation) |
| **B** | Backend Infrastructure (Supabase, API routes, Storage, FLUX) |
| **C** | Auth + AI Pipeline (Clerk, Claude, Upload flow, Dashboard integration) |

---

## Phase 0: Foundation Setup

**Constraint:** Must complete before Phase 1. Tasks within Phase 0 can run in parallel.

### Task 0.1: Project Initialization
**Owner:** Engineer B

- Initialize Next.js 14 app with App Router
- Configure TypeScript strict mode
- Install and configure TailwindCSS
- Install Shadcn UI, initialize with default theme
- Install Motion library
- Create folder structure:
  ```
  /app
    /api
    /(auth)
    /(dashboard)
  /components
    /ui (shadcn)
    /gallery
    /upload
    /modal
  /lib
    /supabase
    /flux
    /claude
  /types
  ```
- Push to shared repo

### Task 0.2: Supabase Project Setup
**Owner:** Engineer B
**Parallel with:** 0.1, 0.3, 0.4

- Create Supabase project
- Create `objects` table:
  ```sql
  create table objects (
    id uuid default gen_random_uuid() primary key,
    user_id text not null,
    original_image_url text not null,
    transformed_image_url text,
    description text,
    status text default 'active' check (status in ('active', 'sold', 'donated', 'tossed')),
    created_at timestamptz default now(),
    updated_at timestamptz default now()
  );
  
  create index idx_objects_user_id on objects(user_id);
  create index idx_objects_status on objects(status);
  ```
- Create storage bucket `object-images` with public read access
- Configure RLS policies (users read/write own objects only)
- Generate environment variables
- Create `/lib/supabase/client.ts` and `/lib/supabase/server.ts` helpers

### Task 0.3: Clerk Authentication Setup
**Owner:** Engineer C
**Parallel with:** 0.1, 0.2, 0.4

- Create Clerk application
- Configure sign-in methods (email + Google OAuth)
- Install `@clerk/nextjs`
- Add Clerk middleware for protected routes
- Configure environment variables
- Create auth layout with `<SignIn />` and `<SignUp />` components
- Verify redirect flow: unauthenticated → sign-in → dashboard

### Task 0.4: Environment & API Keys
**Owner:** Engineer C
**Parallel with:** 0.1, 0.2, 0.3

- Collect all API keys (FLUX.2, Claude, Supabase, Clerk)
- Create `.env.local.example` with all required variables
- Distribute keys to team

### Phase 0 Checkpoint
**All engineers verify before proceeding:**
- `npm run dev` runs without errors
- Can sign in via Clerk and reach empty dashboard
- Can connect to Supabase
- All environment variables loaded

---

## Phase 1: Core Development

**Constraint:** Requires Phase 0 complete. All workstreams run in parallel. Dependencies noted within each workstream.

---

### Workstream A: Frontend UI (Engineer A)

**All tasks in Workstream A can run in parallel** (no internal dependencies).

#### Task A.1: Landing Page

**Route:** `/app/page.tsx`

- Full-viewport hero section
- Bold headline (e.g., "See everything you own. Then let it go.")
- Subheadline explaining value prop
- Single CTA button → Sign Up
- Reference trysaru.com for editorial feel
- Typography: Large headings, Inter or similar sans-serif
- Color: Near-white background, black text, single accent
- Navigation: Logo left, Sign In right

#### Task A.2: Gallery Component

**Component:** `/components/gallery/ObjectGrid.tsx`

```typescript
interface ObjectGridProps {
  objects: Object[];
  onObjectClick: (id: string) => void;
}
```

- CSS Grid layout with responsive columns
- Column count based on object count:
  - 1-12 objects: 4 columns
  - 13-36 objects: 6 columns
  - 37+ objects: 8 columns
- Square aspect ratio cells
- Gap: 4px (tight, Iweins-style)
- Hover state: subtle scale or brightness shift
- Click triggers `onObjectClick`

**Component:** `/components/gallery/GalleryHeader.tsx`
- Displays: "You own {count} objects"
- Count passed as prop, updates reactively

#### Task A.3: Object Detail Modal

**Component:** `/components/modal/ObjectModal.tsx`

```typescript
interface ObjectModalProps {
  object: Object | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: 'keep' | 'sell' | 'donate' | 'toss') => void;
}
```

- Centered modal (max-w-lg) over semi-transparent backdrop
- Click backdrop or X to close
- Large image (transformed, fallback to original)
- Description text (serif font, MOMA style)
- Four action buttons: Keep (gray), Sell (green), Donate (blue), Toss (red)
- Shadcn Button variants

#### Task A.4: Poof! Animation

**Component:** `/components/animation/PoofAnimation.tsx`

- Particle dissolve effect using Motion library
- Image breaks into ~20-30 particles
- Particles scatter outward with randomized velocities
- Fade opacity to 0
- Duration: ~800ms
- On complete, fire callback to remove from DOM
- Use Motion's `AnimatePresence` for exit animations

#### Task A.5: Archive Page

**Route:** `/app/(dashboard)/archive/page.tsx`

- Grid or list of Poof!ed objects
- Each item: thumbnail, description snippet, disposition badge
- Badge colors: Sold=green, Donated=blue, Tossed=red
- Read-only (no actions)
- Empty state: "Nothing here yet. Poof! some objects to see them here."

---

### Workstream B: Backend & FLUX (Engineer B)

#### Task B.1: Image Upload API Route
**Parallel with:** B.2

**Route:** `/app/api/upload/route.ts`
**Endpoint:** `POST /api/upload`

- Accept `multipart/form-data` with `images` field (1-10 files)
- Validate file types (JPEG, PNG, HEIC) and sizes (max 10MB each)
- For each image:
  - Generate unique filename: `{user_id}/{uuid}.{ext}`
  - Upload to Supabase Storage `object-images/originals/`
  - Get public URL
- Return array: `{ "uploads": [{ "id": "temp-uuid", "originalUrl": "https://..." }] }`
- Handle partial failures gracefully

#### Task B.2: FLUX Integration Service
**Parallel with:** B.1

**Service:** `/lib/flux/client.ts`

```typescript
async function transformImage(imageUrl: string): Promise<string | null>
```

- Call FLUX.2 Image Editing API
- Prompt: "Professional product photo on clean white background, centered, soft even lighting, no shadows, studio quality"
- Output: Square (1:1 aspect ratio)
- Upload result to Supabase Storage: `object-images/transformed/{uuid}.jpg`
- Return public URL
- On failure: return `null` (caller falls back to original)
- Timeout: 30 seconds

#### Task B.3: Processing Queue API Route
**Requires:** B.1, B.2, C.2

**Route:** `/app/api/process/route.ts`
**Endpoint:** `POST /api/process`

Request:
```json
{ "uploads": [{ "id": "temp-uuid", "originalUrl": "https://..." }] }
```

Logic per image (parallelized via `Promise.all`):
1. FLUX transformation (B.2) — parallel with step 2
2. Claude description (C.2) — parallel with step 1
3. Create database record with results
4. Return completed object

Response:
```json
{
  "objects": [{ "id": "uuid", "originalImageUrl": "...", "transformedImageUrl": "...", "description": "...", "status": "active" }],
  "errors": []
}
```

#### Task B.4: Object CRUD API Routes
**Parallel with:** B.1, B.2

**Routes:**

`GET /api/objects`
- Returns user's objects where status = 'active'
- Ordered by created_at DESC

`GET /api/objects/archive`
- Returns user's objects where status != 'active'
- Ordered by updated_at DESC

`PATCH /api/objects/[id]`
- Body: `{ "status": "sold" | "donated" | "tossed" }`
- Updates status and updated_at
- Validates user ownership

---

### Workstream C: Auth & Claude (Engineer C)

#### Task C.1: Auth Integration & Protected Routes
**Parallel with:** C.2, C.3

- Configure Clerk middleware to protect `/dashboard/*`
- Create auth context/hook for current user ID
- Create `/app/(dashboard)/layout.tsx`:
  - Navigation: Gallery, Archive, Upload links
  - Clerk `<UserButton />`
  - Sign out functionality

#### Task C.2: Claude Vision Integration Service
**Parallel with:** C.1, C.3

**Service:** `/lib/claude/client.ts`

```typescript
async function generateDescriptions(imageUrls: string[]): Promise<Map<string, string>>
```

- Batch Claude API request with multiple images
- System prompt:
  ```
  You are a curator at a contemporary art museum writing object descriptions for a catalog. 
  For each image, write a brief, evocative description (2-3 sentences) that helps someone 
  visualize the object. Focus on: material, color, form, condition, and character. 
  Style: MOMA exhibition catalog. Tone: observational, precise, slightly poetic.
  
  Return JSON mapping image index to description.
  Example: {"0": "A worn leather wallet...", "1": "A ceramic mug..."}
  ```
- Parse JSON response, return map of URL → description
- On failure: fall back to individual calls, then generic text

#### Task C.3: Upload UI Component
**Parallel with:** C.1, C.2

**Component:** `/components/upload/UploadZone.tsx`

- Drag-and-drop zone with dashed border
- Click to open file picker
- Accept: .jpg, .jpeg, .png, .heic
- Multiple selection (max 10)
- Preview thumbnails before upload
- Validation error if >10 files
- Upload button to trigger submission

**Component:** `/components/upload/UploadProgress.tsx`

```typescript
interface UploadProgressProps {
  files: File[];
  status: Map<string, 'pending' | 'uploading' | 'processing' | 'complete' | 'error'>;
}
```

- Status indicators per file: pending (gray), uploading (spinner), processing (animated), complete (checkmark), error (X with retry)

#### Task C.4: Dashboard Page Integration
**Requires:** A.2, A.3, B.4

**Route:** `/app/(dashboard)/gallery/page.tsx`

1. Fetch objects from `GET /api/objects` on mount
2. Render `<GalleryHeader />` and `<ObjectGrid />`
3. Manage modal state (`selectedObject`, `isModalOpen`)
4. On object click: open modal
5. On modal action:
   - Keep: close modal
   - Sell/Donate/Toss: trigger Poof animation → call PATCH API → remove from state → close modal
6. Empty state: show upload prompt

---

## Phase 2: Integration

**Constraint:** Requires all Phase 1 tasks complete. Integration tasks can run in parallel.

### Task I.1: End-to-End Upload Flow
**Requires:** B.1, B.3, C.3

Test and debug:
1. User opens upload UI
2. Selects images
3. Files upload to Supabase
4. Processing kicks off (FLUX + Claude)
5. Progress UI updates
6. New objects appear in gallery
7. Count updates

### Task I.2: Poof Animation Integration
**Requires:** A.4, C.4
**Parallel with:** I.1, I.3

Connect:
1. Modal action triggers animation on thumbnail (not in modal)
2. Modal closes/fades
3. Particle dissolve plays
4. On complete: object removed, API called, count decrements

Handle edge case: rapid successive Poofs

### Task I.3: Archive Page Integration
**Requires:** A.5, B.4
**Parallel with:** I.1, I.2

Connect:
1. Archive fetches from `GET /api/objects/archive`
2. Verify Poof!ed objects appear with correct disposition
3. Test: Poof → navigate to Archive → object visible

### Task I.4: Error States & Edge Cases
**Parallel with:** I.1, I.2, I.3

Test and handle:
- Partial upload failure
- FLUX failure (fallback to original)
- Claude failure (fallback text)
- Network error during Poof (retry, don't lose data)
- Empty states (gallery, archive)
- Logout mid-upload

---

## Phase 3: Polish & Demo Prep

**Constraint:** Requires Phase 2 complete. All polish tasks can run in parallel.

### Task P.1: Demo Account Seeding
**Owner:** Engineer B

- Create demo user account in Clerk
- Prepare 50 diverse object photos (mix of categories, colors)
- Run through processing pipeline
- Verify all appear in demo gallery
- Document credentials

### Task P.2: Landing Page Polish
**Owner:** Engineer A
**Parallel with:** all P tasks

- Refine copy and typography
- Add subtle animations
- Mobile responsiveness
- Test CTA flow

### Task P.3: Animation Polish
**Owner:** Engineer A
**Parallel with:** all P tasks

- Fine-tune particle dissolve timing
- Test across browsers (Chrome, Safari, Firefox)

### Task P.4: Gallery Polish
**Owner:** Engineer A
**Parallel with:** all P tasks

- Verify grid scales 10→100+ objects
- Loading states (skeleton/blur placeholders)
- Smooth scroll
- Mobile responsiveness

### Task P.5: Performance Audit
**Owner:** Engineer B
**Parallel with:** all P tasks

- Image optimization
- Loading states for slow networks
- Lazy load gallery images
- Check for memory leaks in animation

### Task P.6: Demo Script Rehearsal
**Requires:** P.1 through P.5 complete

**2-minute demo flow:**

| Time | Action |
|------|--------|
| 0:00-0:10 | Landing page |
| 0:10-0:25 | Sign in to demo account |
| 0:25-0:45 | Gallery reveal, pan across 50 objects |
| 0:45-1:15 | Live upload 2 objects |
| 1:15-1:35 | Click object, show modal, read description |
| 1:35-1:50 | Poof! the object |
| 1:50-2:00 | Show Archive |

Rehearse 3x, identify issues.

### Task P.7: Deploy & Backup
**Parallel with:** P.1-P.5

- Deploy to Vercel
- Test production build end-to-end
- Prepare local fallback
- Screenshot/video backup of demo flow

---

## Dependency Graph

```
PHASE 0 (Sequential gate)
┌─────────────────────────────────────────────┐
│  0.1 Project Init      ┐                    │
│  0.2 Supabase Setup    ├─► All run parallel │
│  0.3 Clerk Setup       │                    │
│  0.4 API Keys          ┘                    │
└─────────────────────────────────────────────┘
                    │
                    ▼
PHASE 1 (Three parallel workstreams)
┌────────────────┬────────────────┬────────────────┐
│  WORKSTREAM A  │  WORKSTREAM B  │  WORKSTREAM C  │
│  (Frontend)    │  (Backend)     │  (Auth + AI)   │
│                │                │                │
│  A.1 Landing   │  B.1 Upload API│  C.1 Auth      │
│  A.2 Gallery   │  B.2 FLUX Svc  │  C.2 Claude Svc│
│  A.3 Modal     │  B.4 CRUD APIs │  C.3 Upload UI │
│  A.4 Animation │       │        │       │        │
│  A.5 Archive   │       ▼        │       │        │
│       │        │  B.3 Process   │◄──────┘        │
│       │        │  (needs B.1,   │                │
│       │        │   B.2, C.2)    │                │
│       │        │                │                │
│       └────────┼────────────────┼─► C.4 Dashboard│
│                │                │   (needs A.2,  │
│                │                │    A.3, B.4)   │
└────────────────┴────────────────┴────────────────┘
                    │
                    ▼
PHASE 2 (Integration - parallel)
┌─────────────────────────────────────────────┐
│  I.1 Upload Flow     (needs B.1, B.3, C.3)  │
│  I.2 Poof Integration (needs A.4, C.4)      │
│  I.3 Archive Integration (needs A.5, B.4)   │
│  I.4 Error Handling                         │
└─────────────────────────────────────────────┘
                    │
                    ▼
PHASE 3 (Polish - parallel, then rehearsal)
┌─────────────────────────────────────────────┐
│  P.1 Demo Seeding  ┐                        │
│  P.2 Landing Polish│                        │
│  P.3 Animation     ├─► All parallel         │
│  P.4 Gallery Polish│                        │
│  P.5 Performance   │                        │
│  P.7 Deploy        ┘                        │
│           │                                 │
│           ▼                                 │
│  P.6 Rehearsal (sequential, after above)    │
└─────────────────────────────────────────────┘
```

---

## Critical Path

The longest sequential chain determines minimum time:

```
Phase 0 checkpoint
       ↓
B.1 + B.2 (parallel) → B.3 → I.1 → P.1 → P.6
       ↓
      C.2 ─────────────┘
```

**Bottleneck:** Task B.3 (Processing API) blocks on three dependencies (B.1, B.2, C.2). Prioritize these.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| FLUX API slow/down | Fallback to original image; pre-process demo objects early |
| Claude rate limits | Batch requests; cache descriptions |
| Animation performance | Reduce particle count if needed |
| Time overrun | Cut Archive page first; focus on core demo flow |

---

## Success Criteria

- [ ] Landing page live and styled
- [ ] User can sign up and sign in
- [ ] User can upload 1-10 images
- [ ] Images transformed via FLUX (or fallback)
- [ ] Descriptions generated via Claude Sonnet 4.5
- [ ] Gallery displays active objects
- [ ] Object count displays and updates live
- [ ] Modal shows detail and actions
- [ ] Poof animation plays on sell/donate/toss
- [ ] Poof!ed objects appear in Archive
- [ ] Demo account seeded with 50 objects
- [ ] 2-minute demo video recorded
- [ ] Deployed to production URL