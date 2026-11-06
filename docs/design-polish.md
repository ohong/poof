# November 6 design pass

## Direction and scope

Applied Emil's design engineering principles, then the Polish skill. Compared replacing the visual system with refining the existing photographic catalog. Refinement preserves Poof's identity and limits behavioral risk. The creator selected a deployable preview, with hosted accounts deferred, and Resend for later sign-in email.

## Changes

| Before                                                            | After                                                         | Why                                                        |
| ----------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------- |
| Small uppercase labels, repeated taglines, and oversized counters | Readable type, compact collection headings, and quiet counts  | Bring the photos forward and reduce visual noise           |
| Hover photo zooms and a 600 ms shrinking/blur effect              | Stable photos, press feedback, and a short pointer-only exit  | Make repeated actions feel immediate                       |
| Close controls inside scrolling content                           | A fixed dialog toolbar and a separate scroll area             | Keep close reachable on phones and long forms              |
| Unsaved edits could disappear on close or a decision              | Discard confirmation; edits and decisions save together       | Preserve the user's work                                   |
| Undo could race the exit timer                                    | Interrupt the exit and restore the item without stale removal | Make quick reversals reliable                              |
| Actions lost focus when temporarily disabled                      | Restore focus after completion and return focus after closure | Keep keyboard use predictable                              |
| One 2,092,029-byte sample sheet                                   | Nine cropped WebP photos totaling 122,228 bytes               | Load smaller photos individually, with native lazy loading |
| Missing account configuration looked like an outage               | An explicit product-preview experience                        | Match the release's actual capabilities                    |

Colors remain part of one warm palette. Measured token contrast: muted/paper 5.15:1, muted/wash 4.70:1, accent/paper 4.99:1, white/green 8.93:1, and field borders/white 3.35:1. Body and supporting mobile text use at least 14 CSS pixels. Controls use a 44-pixel minimum target. Keyboard actions suppress motion; reduced-motion preferences remove movement.

The sample-image comparison is a raw-file byte measurement, not a network or page-speed benchmark. Source imagery is unchanged. The original PNG remains recoverable in commit `2e59c61`.

## Verification

The Impeccable mechanical detector reported no findings. It is one check alongside browser inspection. Final browser, build, API, and deployment evidence is recorded in the release handoff. Checks are performed in this chat; no helper agents or independent review were used.
