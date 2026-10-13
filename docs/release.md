# Release and operations

## Current release state

The rebuilt product is local. It has not been deployed. The connected accounts list Supabase organization **Side Projects** and Vercel team **Pacific Systems** (`ohong-projects`). These are discovered options, not approved resource targets. Organization confirmation, cost confirmation, SMTP delivery, and staged verification remain open.

Do not reuse unrelated projects. Do not reset a hosted database to install this app. The original configured Supabase address did not resolve during discovery; the creator confirmed there is no existing Poof data to migrate.

## Cloud setup

1. Confirm the Supabase organization.
2. Obtain the project's current cost quote and owner confirmation.
3. Create a dedicated project in an appropriate US West region, or use a verified owner-provided Poof project.
4. Apply the checked-in migrations with the confirmed project reference. Use `supabase link --project-ref <confirmed-ref>`, inspect the target, then `supabase db push`. Never use `db reset` on a hosted target.
5. Verify that `object-images` is private and its maximum upload size is 2 MB.
6. Configure a verified SMTP sender and domain. Supabase's default email service is not a public-launch delivery plan.
7. Install `supabase/templates/magic-link.html` for both confirmation and magic-link email templates. Use six-digit codes and a one-hour expiry, or update the UI/template together.
8. Set the Auth site URL to the confirmed app origin. Add the staging origin when needed.
9. Store the browser-visible URL/publishable key and server-only secrets in Vercel environment settings. Use separate staging and production database resources where available.
10. Rebuild with the cloud environment. Never deploy a prebuilt artifact containing local Supabase URLs.
11. Stage the app in the confirmed Vercel team and test that exact deployment before promotion.

`vercel.json` selects `sfo1` and one daily maintenance invocation at 09:23 UTC. Confirm the database region and hosting plan before using it. Set a strong `CRON_SECRET`; Vercel supplies its bearer header for scheduled requests. The route does nothing without correct authentication.

## Staged acceptance

Use two dedicated test accounts and disposable object photos. Confirm email delivery and code entry, private uploads, job completion after closing/reloading, original/catalog comparison, price labeling, edits, photo download, copied drafts, archive/undo, export, and object/account removal. Confirm that the second account cannot read or change the first account's data or image bytes.

Inspect narrow screens, keyboard focus, and reduced motion. Check a physical phone's camera and HEIC behavior. The local QA scripts deliberately refuse hosted URLs; do not point their service-role fixture creation at production.

After promotion, verify the public URL, authentication, one real upload, persistence, and maintenance authorization. Inspect function logs for new errors. Hosted verification is separate from the local evidence in `docs/pls-fix.md`.

## Limits and cost controls

SQL reserves uploads and AI attempts transactionally. Repeating an existing upload ID does not reserve another slot. Paid model submissions are not retried automatically after uncertain responses. An explicit retry consumes another attempt. Three attempts per object is the maximum.

Defaults: 50 uploads per account per UTC day, 200 globally; 50 AI attempts per account per UTC day, 200 globally; 1,000 objects per account, 10,000 across the initial deployment. The AI limits may be lowered through environment variables. Raising upload/inventory ceilings requires a reviewed schema change. Review provider and platform spending caps independently; count limits are not a monetary billing guarantee.

The pinned runtime models are `flux-2-klein-9b` and `claude-haiku-5-5`. `flux-2-pro` is the supported image alternative. Change models only after representative quality, latency, and cost checks. A successful response does not establish correct object identity or condition.

## Diagnostics and recovery

- `/api/health` reports configuration presence. It does not prove credential validity or provider health.
- Structured logs use `poof.processing.*`, `poof.description.*`, `poof.image.*`, `poof.request.failed`, and `poof.maintenance.complete`. Logs omit credentials, image bytes, and provider response bodies.
- Inspect durable runs through Vercel Workflow observability. In local development, use the installed Workflow CLI help to inspect runs. Do not pass run arguments or secret-bearing traces to public artifacts.
- Provider failure preserves the prepared original and exposes a retry/manual-edit path. User edits are retained during retries.
- Maintenance marks only terminal, stale runs for manual retry. It does not automatically resubmit paid generation or interrupt a still-running job.
- A stale claim without a recorded run also becomes available for manual retry after 30 minutes.
- Signed upload capabilities expire after two hours. Maintenance removes canonical, unreferenced media older than three hours through the Storage API. It preserves paths referenced by records, including an anticipated catalog image whose save may be interrupted.
- Deletion failures remain retryable. Account removal blocks new allocations before stopping jobs and removing files. Records are removed after storage confirms cleanup.

To recover an incident, pause new uploads/processing through reviewed caps or deployment configuration, preserve stored originals, inspect the affected run, and repair the cause before retrying. Do not drop tables or erase a bucket as a repair shortcut.

## Backup and rollback

Use the hosting provider's database backup provisions appropriate to the chosen plan. Back up stored images separately; database snapshots do not contain image bytes. User JSON export preserves object details and decisions, while photos can be downloaded from each object.

Retain a tested Vercel deployment for rollback. Roll back code to that deployment when needed; do not reverse a data migration blindly. These migrations create a new app schema. Future migrations must preserve existing users and objects and have a verified recovery path.

## Dependencies and assets

`package-lock.json` is authoritative. The npm lock replaces the inconsistent original dual-lock setup. Security overrides pin devalue 5.9.4 and nanoid 5.1.16, preserving their existing major versions while addressing published advisories. Recheck these pins when upgrading Workflow.

The production dependency audit reports zero findings. The full audit reports five high-severity entries from one unpatched [braces advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), propagated through Next's development lint dependencies. The audited braces version is 3.0.3, and no patched release is published. The app does not pass user input into these lint globs. Do not apply npm's suggested Next lint downgrade; recheck the upstream patch before changing this development dependency chain.

Generated illustrative assets and prompts are documented in `docs/asset-prompts.md`. The public sample collection is labeled and separate from stored inventories. Preserve dependency licenses and notices when redistributing the app. No creator or user credentials belong in source, logs, screenshots, or release artifacts.
