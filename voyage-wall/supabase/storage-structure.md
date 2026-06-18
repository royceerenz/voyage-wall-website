# Supabase Storage Structure

## Purpose

This document plans how Voyage Wall should store event imagery, guest uploads, generated thumbnails, and future exports.

## Planned Buckets

### `event-assets`

Stores event-owned visual assets.

Examples:

- Hero images.
- Couple photos.
- Theme artwork.
- QR code images if generated and stored.

Suggested path pattern:

```text
event-assets/{eventId}/hero/{filename}
event-assets/{eventId}/theme/{filename}
event-assets/{eventId}/qr/{filename}
```

### `memory-uploads`

Stores guest-submitted memory photos.

Suggested path pattern:

```text
memory-uploads/{eventId}/{memoryId}/original.{ext}
memory-uploads/{eventId}/{memoryId}/display.{ext}
memory-uploads/{eventId}/{memoryId}/thumb.{ext}
```

### `exports`

Future bucket for post-event downloads and keepsake exports.

Suggested path pattern:

```text
exports/{eventId}/photos.zip
exports/{eventId}/messages.csv
exports/{eventId}/keepsake.pdf
```

## Public Access Strategy

Recommended MVP approach:

- Public Love Wall should display approved images.
- Guest upload paths should not expose unnecessary private metadata.
- Preferred MVP: keep `memory-uploads` private and serve approved images through signed URLs or an application-controlled URL strategy.
- If using public buckets for simplicity, never treat obscure paths as the only protection. Database visibility rules still decide what appears.

Final choice depends on implementation complexity and event privacy requirements.

## Upload Validation

Recommended constraints:

- Accepted formats: JPG, PNG, HEIC where supported.
- Maximum original size: decide before build, likely 8-12 MB for guest upload reliability.
- Generate display-sized image for wall performance.
- Generate thumbnail for fast grid loading if needed.
- Reject or transform files that cannot be displayed safely by target browsers.
- Strip sensitive metadata when generating display images where practical.

## Image Renditions

### Original

Purpose: preserve submitted photo quality.

Use:

- Post-event downloads.
- Future album/export features.

### Display

Purpose: Love Wall cards and detail views.

Use:

- Optimized loading.
- Better mobile performance.

### Thumbnail

Purpose: fast grid previews.

Use:

- Large walls.
- Admin moderation queues.

## Security Considerations

- Validate MIME type server-side where possible.
- Do not trust file extensions alone.
- Limit upload size.
- Prevent guests from overwriting existing files.
- Keep event IDs and memory IDs in predictable internal structure, but avoid exposing admin-only paths.
- Consider virus/content scanning for future versions.
- Rate-limit guest submissions by event and request source where possible.
- Use signed upload flows or server-mediated storage operations if direct public upload rules become too broad.
- Ensure hidden/deleted memories are not reachable from public wall data.

## Lifecycle Policy

Open decisions:

- How long should original images be retained?
- Should hidden/deleted memory files remain in storage?
- Should exports expire after a set period?
- Should couples be able to permanently delete an event archive?

## MVP Recommendation

Start with:

- `event-assets`
- `memory-uploads`
- Private `memory-uploads` bucket if feasible.
- Display-sized image paths stored on the memory record.

Defer:

- `exports`
- Advanced rendition pipeline beyond original and display sizes.
- Automated cleanup jobs
