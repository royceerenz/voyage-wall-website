# MVP Scope

## MVP Objective

Launch a couple-specific wedding memory wall that lets guests scan a QR code, upload a photo, add a message, and view shared memories on a Love Wall.

## Included In MVP

### Guest Experience

- Couple-branded welcome screen.
- "Share a Memory" CTA.
- Photo upload from device.
- Message field.
- Optional guest name.
- Submit flow.
- Success confirmation.
- Public Love Wall.
- Empty, loading, success, and error states.

### Content Display

- Memory cards with photo, message, and guest name.
- Responsive wall layout.
- Newest memories shown clearly.
- Memory detail view deferred unless explicitly pulled into the first build.

### Backend Planning

- Event records.
- Memory records.
- Image storage.
- Submission status field.
- Basic moderation-ready data model.
- Upload rate limiting or equivalent abuse protection.
- Public read rules for approved memories only.
- Admin-only ability to hide/delete memories.

### Safety

- File validation.
- Size limits.
- Basic content status handling.
- Ability to hide/delete memories at launch, even if through a minimal private operator tool.
- Ability to close submissions for an event.
- Clear guest-facing privacy note before submission.

### Design

- Premium nautical wedding visual direction.
- Mobile-first hero.
- Large pill CTA.
- Elegant typography.
- Beach/rope/floral asset strategy.

## Not Included In MVP

- Guest accounts.
- Social reactions.
- Comments on memories.
- Public event discovery.
- Payment flow.
- Full event planning dashboard.
- Advanced photo editing.
- AI moderation.
- Multi-language support.
- Printed album generation.
- Native mobile app.

## MVP Admin Assumption

The first MVP may use simple private tooling instead of a polished admin dashboard. However, launch still requires an authenticated operational path to hide/delete memories and close submissions. Direct database editing alone is too risky during a live wedding.

## Launch Readiness Checklist

- Guest can complete upload on iOS Safari.
- Guest can complete upload on Android Chrome.
- Love Wall loads quickly with sample data.
- Failed uploads show recovery path.
- Empty wall has clear CTA.
- Hero image and text are readable.
- QR code points to correct event.
- Storage rules are reviewed.
- Submission content can be removed if needed.
- Event can be closed to new submissions.
- Instant/review-first publishing mode is configured and reflected in copy.
- Love Wall has a defined initial page size and loading strategy.
- Public UI never exposes storage paths or admin metadata.

## MVP Risks To Resolve Before Build

- Final confirmation that MVP uses instant publish by default.
- Maximum image size and compression approach.
- Rate limit and anti-spam approach.
- Whether guest passcode protection is needed.
- Whether the couple needs a download/export function at launch.
- Whether a minimal admin tool is included in the first implementation sprint.

## Recommended MVP Decision Defaults

- Memories appear instantly for the first private event, with moderation-ready status in the data model.
- Message required.
- Guest name optional.
- Image required.
- Admin export deferred.
- Memory detail view optional.
- Default MVP excludes memory detail unless the first implementation has spare capacity after upload, wall, and operator controls are stable.
- Minimal authenticated operator controls required.
- Initial wall load limited to the newest approved memories, with incremental loading after that.
