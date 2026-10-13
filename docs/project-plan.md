# Release checklist

The original hackathon plan is retained in Git history. The current release follows the creator decisions in `docs/pls-fix.md` and behavior in `docs/specs.md`.

1. Complete the rebuild and verify real local journeys.
2. Reproduce installation and migrations on the dedicated local stack.
3. Confirm the cloud organization and quoted service costs.
4. Create or connect a dedicated hosted database and private bucket.
5. Configure SMTP, both code templates, and production environment variables.
6. Stage a Vercel deployment in the confirmed team.
7. Exercise signup, upload, processing, drafts, archive/undo, deletion, and account isolation against that deployment.
8. Check a physical phone's camera/upload flow and email-code entry.
9. Promote the tested deployment and confirm maintenance, diagnostics, and recovery.

A successful local build is one release check. It does not establish hosted operation, email delivery, or user demand.
