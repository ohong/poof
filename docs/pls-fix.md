# Poof release handoff — November 6, 2026

## Current scope and authority

The creator authorized committing, pushing, and deploying the polished preview. Hosted accounts and uploads are deferred. Resend is selected for later sign-in email delivery; no sender or hosted database has been provisioned. The public preview needs no account or paid provider credentials. Edits reset when the tab reloads.

The release retains free access, mobile-browser support, editable sale drafts, labeled price suggestions, copy/share, and reversible Sell/Donate/Toss decisions. Direct marketplace posting is outside this release.

## Source and deployment

The original rebuild is commit `2e59c61`, based on `b5e5da4`. The November design pass is on `codex/poof-rebuild` in `/Users/ohong/.codex/worktrees/poof-polish/poof`. The original checkout's creator README changes and `temp/` are preserved. The removed October worktree is not the current source.

Deployment is pending at this checkpoint. The intended target is a dedicated Git-linked Poof project in Vercel team **Pacific Systems** (`ohong-projects`). The release commit, deployed URL, and hosted checks will be recorded after deployment. No existing project is reused.

## Design and behavior

Applied Emil's design engineering principles, then Polish. Retained the photographic catalog, cream paper, dark green, restrained terracotta, Instrument Serif, and DM Sans. Simplified headings, labels, counters, and motion. Added readable mobile type, consistent targets, fixed dialog controls, and reliable keyboard focus. See `design-polish.md` for the before/after comparison and measurements.

Unsaved edits require an explicit discard. Decisions save edits atomically. Rapid Undo interrupts an exit instead of losing the item. Copy retains decimal prices. Currency changes clear old estimates. Empty archives and filters offer working recovery actions. Unconfigured sign-in explains the preview instead of presenting an outage.

## November verification

| Observable outcome | Evidence and result |
| --- | --- |
| Source installs and builds reproducibly. | Fresh `npm ci --ignore-scripts` passed. Final `npm run verify` passed lint, TypeScript, and production build without backend environment variables. |
| Preview routes state their actual capabilities. | Landing, demo, sign-in, and privacy return 200. Unknown routes return 404. Account API returns 503 while services are absent; sign-in has no enabled email form. |
| Phone, tablet, and desktop layouts remain readable. | Production-browser checks passed at 320, 390, 768, and 1280 CSS pixels. No horizontal overflow. Long names/descriptions remain within the dialog. Supporting gallery text is at least 14 pixels; controls have 44-pixel minimum targets. Physical phones and Safari remain untested. |
| Keyboard and motion preferences work. | Enter opens without animation; Escape returns focus to the opener. Tabs, discard recovery, save/copy focus, Archive/Undo, and empty states passed. Aside direct browser control verified reduced-motion media preference: no dialog/overlay animation and immediate decisions. |
| Drafts and decisions preserve edits. | Whitespace names show a focused validation error. Save trims names and retains content. Copy produces US$9.50. Currency changes clear stale estimates. Sell saves dirty notes and Archive permits undo, including a rapid undo during exit. Native external share destinations remain untested. |
| The local private backend remains functional. | Real auth/API tests passed for uploads, persistence, idempotency, edits, Archive/Undo, export, validation, cross-origin rejection, private media isolation, atomic quotas, erasure, and session invalidation. New-user OTP focus, invalid-code recovery, and sign-out passed in the browser. Local mail is not external delivery. |
| Durable processing survives lifecycle changes. | Real BFL and Anthropic requests completed through the production API and Workflow in 13 seconds for one fixture. Duplicate submission stayed at one attempt. Removal during processing cancelled the run and left no media. This fixture does not establish universal model fidelity. |
| Recovery and configured scale are bounded. | Maintenance tests passed for stale/interrupted runs and orphan cleanup, with time/state simulated. A 1,000-record metadata test passed; the conservative signed-URL payload model was 2,598,526 bytes. This is not a concurrency benchmark. Local Supabase advisors found no issues. |
| The UI has no known console accessibility warnings. | A fresh production tab opened item details with a valid generated description ID and no warnings/errors. The Impeccable detector returned zero findings; it is one check alongside visual inspection. |

The final backend tests used the updated Workflow dependencies. Later changes concerned input validation, focus, and dialog descriptions. The final production build and preview checks cover those changes. All disposable local accounts were removed. Verification and review stayed in this chat; no helper agents or independent reviewer were used.

## Evidence and local state

November artifacts are under `/Users/ohong/.codex/visualizations/2026/10/13/01a133ee-42a3-7470-bd58-7879e9b01af6/polish-2026-11-06`. They include browser screenshots, build and provider results, reduced-motion evidence, dependency audit, and a source manifest. Logs containing local service keys are excluded.

The dedicated local Docker stack is `poof-rebuild` on ports 56321–56329. Private verification credentials are retained only in the ignored, mode-600 `.env.private-verification` file. The public preview build uses no account/provider environment. The original checkout's environment is untouched.

## Limits and next release

The production dependency audit contains 20 moderate entries propagated from one minimatch advisory; there are no high or critical findings. See `release.md`. Physical-device camera/HEIC, Safari, external email delivery, hosted auth/storage, and native share destinations are not verified by this preview release.

To enable private accounts later, create a dedicated hosted Supabase project after its required organization/cost choices, configure Resend with a verified sender domain, apply migrations without resetting hosted data, and verify the exact staged deployment. Follow `release.md`. Existing October evidence is preserved in `history/2026-10-13-rebuild.md` and does not establish current hosted readiness.
