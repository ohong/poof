# Branch Comparison: main vs oh-gallery

## Overview
Both branches implement the same core features but with different architectural approaches.

---

## Key Architectural Differences

### 1. **Route Structure**

**main:**
- Uses Next.js route groups: `(dashboard)` and `(auth)`
- Routes: `/gallery`, `/archive`, `/upload`
- Cleaner URLs, organized by purpose

**oh-gallery:**
- Flat structure: `app/gallery/*`
- Routes: `/gallery`, `/gallery/archive`, `/gallery/upload`
- More nested URLs

---

### 2. **State Management**

**main:**
- ❌ No Zustand store - uses local component state
- Direct API calls in components
- Simpler but more verbose

**oh-gallery:**
- ✅ Centralized Zustand store (`lib/store.ts`)
- API methods in store (fetchObjects, updateObjectStatus)
- Better separation of concerns
- Easier to share state across components

---

### 3. **Gallery Page Implementation**

**main:** `app/(dashboard)/gallery/page.tsx`
- Uses local useState for objects
- Direct fetch calls in useEffect
- Animation with DOM position calculation
- Simpler but less maintainable

**oh-gallery:** `app/gallery/page.tsx`
- Uses `useGalleryStore` hook
- Store handles fetching/loading/errors
- motion/react for animations
- Better error handling with error state

---

### 4. **Upload Page**

**main:** `app/(dashboard)/upload/page.tsx`
- Simpler implementation
- Basic FileProgress interface
- Sequential status updates (uploading → processing → complete)
- Auto-redirects to gallery on complete

**oh-gallery:** `app/gallery/upload/page.tsx`
- More robust with UploadRecord tracking
- Maps upload IDs to filenames
- More detailed status tracking
- Success screen with explicit "View Gallery" button

---

### 5. **Layout & Design**

**main:** `app/(dashboard)/layout.tsx`
- Warm color scheme: `#FAF8F5` background, `#1A1A1A` text
- Pill-shaped nav buttons
- Max-width container (max-w-7xl)
- Modern, softer aesthetic

**oh-gallery:** `app/gallery/layout.tsx`
- Museum-style minimal design
- Underline active state indicator
- Edge-to-edge with responsive padding
- Subtle grain texture overlay
- More sophisticated, gallery-like feel

---

### 6. **API Processing**

**main:** `app/api/process/route.ts`
- Processes FLUX + Claude in parallel with Promise.allSettled
- Single-pass insertion into database
- Simpler error handling

**oh-gallery:** `app/api/process/route.ts`
- Two-stage: FLUX first, then Claude with smaller images
- Uses transformed images for Claude (optimization)
- More detailed error tracking per step
- Better performance (smaller images to Claude)

---

### 7. **Additional Files**

**oh-gallery has:**
- ✅ `lib/supabase/schema.sql` - complete database schema
- ✅ `app/error.tsx`, `app/loading.tsx`, `app/not-found.tsx` - better UX
- ✅ `scripts/test-flux.ts` - testing utilities
- ✅ `scratchpad.md` - development notes
- ✅ `.claude/settings.local.json` - Claude settings

**main has:**
- ✅ `app/(auth)/*` - Clerk authentication pages
- ✅ Cleaner route structure
- ✅ `components/ui/card.tsx` - additional UI component

---

## Type Differences

**main:**
- Uses `InventoryObject` consistently
- Simpler type system

**oh-gallery:**
- Has `ObjectItem` type (conflicts with main)
- `UploadRecord` type for tracking uploads
- More detailed types for upload states

---

## Recommendations

### Option A: Keep main, cherry-pick from oh-gallery
**Best if:** You prefer the cleaner route structure and don't need the store.

**Add from oh-gallery:**
- ✅ Database schema (`lib/supabase/schema.sql`)
- ✅ Error/loading pages for better UX
- ✅ Museum-style design (if preferred)
- ✅ Two-stage API processing (performance optimization)

### Option B: Keep oh-gallery, cherry-pick from main
**Best if:** You value the Zustand store and more sophisticated architecture.

**Add from main:**
- ✅ Route group structure (cleaner URLs)
- ✅ Warm color palette (if preferred)

### Option C: Merge both (Recommended)
**Combine the best of both:**
- ✅ Route groups from main (`(dashboard)` structure)
- ✅ Zustand store from oh-gallery (better state management)
- ✅ Two-stage processing from oh-gallery (performance)
- ✅ Design choice (museum vs warm - your preference)
- ✅ Error/loading pages from oh-gallery

---

## Questions for Decision

1. **Route structure:** Prefer `(dashboard)` groups or `app/gallery/*`?
2. **State management:** Want Zustand store or keep it simple?
3. **Design aesthetic:** Museum minimal or warm modern?
4. **Processing:** Keep parallel or two-stage (FLUX → Claude)?

---

## Files to Watch for Conflicts

- `app/api/process/route.ts` - Different implementations
- `types/index.ts` - ObjectItem vs InventoryObject
- `lib/store.ts` - Only exists in oh-gallery
- Layout/styling files - Different color schemes
- `bun.lock` - May need regeneration after merge
