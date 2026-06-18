# Voyage Wall Agent Guide

## Project Intent

Voyage Wall is a premium wedding memory wall website. Guests arrive by scanning a QR code at the wedding venue, upload a photo, add a short message, and see their memory appear on a shared Love Wall for the couple and other guests.

This project is currently in planning mode. Do not implement production HTML, CSS, JavaScript, database migrations, or deployment automation until the planning documents are reviewed.

## Current Phase

- Phase: project architecture and documentation.
- Primary focus: product strategy, UX planning, information architecture, design direction, component planning, accessibility, MVP definition, and Supabase data/storage planning.
- Source inspiration: the provided Voyage Wall Figma design and mobile screenshot with a nautical wedding aesthetic, deep blue palette, script typography, beach photography, rope/floral illustration accents, and a large "Share a Memory" CTA.

## Working Rules

- Keep the experience mobile-first because most wedding guests will use phones.
- Treat QR entry as the primary acquisition path.
- Prioritize emotional clarity over feature density.
- Keep guest participation fast: upload, message, submit, celebrate.
- Avoid adding account creation to the MVP guest flow.
- Use warm, premium, nautical wedding language.
- Plan for moderation, privacy, and safe content handling from the start.
- Treat "instant" as immediate guest feedback plus immediate wall publishing only when the event is configured for instant mode.
- Do not launch without an operational path to hide/delete submissions and close the event to new uploads.

## Directory Responsibilities

- `docs/`: product, UX, design, accessibility, scope, and roadmap planning.
- `assets/`: future visual references, generated art, icons, textures, and mockups.
- `src/`: reserved implementation folders. Keep empty until build begins.
- `supabase/`: database and storage planning for the future backend.

## Build Guardrails

When implementation begins later:

- Do not add unrelated frameworks without a clear reason.
- Match the approved visual direction before optimizing or expanding.
- Keep uploads resilient on mobile networks.
- Use image compression before upload where practical.
- Validate files on client and server.
- Treat all guest-submitted content as untrusted.
- Preserve accessibility for forms, buttons, errors, focus states, and wall browsing.

## Definition Of Ready For Build

Implementation can begin when the following are approved:

- MVP scope.
- First-screen visual direction.
- Guest upload flow.
- Love Wall layout behavior.
- Content moderation approach.
- Supabase schema and storage policies.
- Asset strategy for photography, rope/floral illustrations, icons, and textures.
- Publishing mode, rate limiting, and image processing strategy.
