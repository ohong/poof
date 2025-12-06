# PR: Gallery UI + API Integration

## Summary
MoMA-inspired UI redesign with full mobile responsiveness and API integration for the gallery experience.

## Changes

### UI/UX
- [x] Landing page with staggered animations, mobile scroll indicator
- [x] Gallery grid with responsive columns (2-8 cols based on screen/count)
- [x] Modal redesigned as museum wall label with bottom sheet on mobile
- [x] Archive page with catalog-style cards
- [x] Upload page with progress tracking
- [x] Poof animation with rotation and upward particle bias

### Mobile Responsiveness
- [x] Responsive nav header (smaller on mobile, shortened labels)
- [x] Touch-friendly buttons and spacing
- [x] Upload zone preview grid adapts to screen size
- [x] HEIC files show placeholder instead of broken preview

### API Integration
- [x] Gallery fetches from `/api/objects`
- [x] Archive fetches from `/api/objects/archive`
- [x] Upload connects to `/api/upload` + `/api/process`
- [x] Supabase client uses sync `createServerClient` pattern
- [x] Improved error handling with user-friendly messages

### Bug Fixes
- [x] Fixed Zustand infinite loop (useShallow)
- [x] Fixed FLUX + Supabase client imports
