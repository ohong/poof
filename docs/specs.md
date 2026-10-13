# Poof — first public release

## Intended outcome

People can see their belongings together, choose what to keep or release, and prepare an editable sale listing. The audience comes from the creator's original notes: aspiring minimalists and people decluttering. Product value and demand remain untested.

## Creator-confirmed scope

Free access. Desktop and mobile browsers. Clean catalog images and descriptions. Editable sale drafts, suggested price ranges, and copy/share. Sell, Donate, and Toss record decisions and move objects into Archive immediately. Every decision can be undone. There are no existing users or data to migrate.

Marketplace posting, storefronts, payments, negotiation agents, and semantic search are outside this release.

## Essential journeys

1. Sign in with an emailed one-time code. New and returning users share the same entry point.
2. Select one object per photo. Preview and prepare up to ten files. Each file reports its own state and error.
3. Save the prepared photo in private storage before starting AI work. Closing or reloading the page does not cancel a saved job.
4. Describe the original photo and edit its background independently. Keep the original available. Provider failures retain the object and expose a recovery path.
5. Browse, search, filter, and change grid density. Lists carry small records; full notes and sale drafts load when an object opens.
6. Edit object details or a sale draft. Review the estimated range, choose a currency and asking price, then copy/share the draft or download the photo.
7. Keep or archive an object. Undo from the notification or restore it from Archive.
8. Export details or permanently remove an object/account after explicit confirmation.

## Limits chosen for launch

- Ten selected files per batch; two simultaneous preparation/upload workers.
- Raw files up to 10 MB. Browser preparation removes metadata, resizes to a maximum 1,600-pixel edge, and writes JPEG.
- Private uploads up to 2 MB. Catalog output is 1,024×1,024.
- At most 1,000 objects per account and 10,000 across this initial release.
- Fifty upload allocations per account per UTC day; 200 globally.
- Fifty AI attempts per account per UTC day; 200 globally by default. Retries count. At most three attempts per object.
- USD, CAD, GBP, EUR, and AUD estimates. Changing currency clears the old estimate and requires an explicit asking price.

Count limits bound activity, not total monetary spending. Hosting, storage, email, provider pricing, and retries still need operator controls.

## Domain invariants

Accounts read only their own records and media. Anonymous clients cannot read private photos. Browser credentials cannot mutate processing state, ownership, quotas, or paths. The server allocates image paths; callers cannot supply arbitrary URLs for processing.

Each upload has one stable object ID. Repeated allocation/finalization does not create another object or spend another processing attempt. Descriptions use the original, not a potentially altered catalog image. User edits survive retries. Prices are labeled general estimates, with no invented sold-listing evidence.

Archive records intentions, not completed sales or donations. Permanent removal is separate from archiving. Account removal blocks new allocations, stops active jobs, removes media, and then deletes the account.

## Acceptance and release evidence

The implementation-independent criteria and actual verification results live in `docs/pls-fix.md`. Hosted email delivery, staged deployment, real-device camera behavior, and production operations require separate checks before launch.
