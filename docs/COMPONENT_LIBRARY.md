# Component Library

This document defines planned UI components only. It does not contain implementation code.

## Brand Components

### Event Hero

Purpose: first-screen emotional entry point.

Contains:

- Background image.
- Navy overlay.
- Decorative nautical artwork.
- Couple/event label.
- Script title.
- Invitation copy.
- Primary CTA.

States:

- Default.
- Missing hero image fallback.
- Long couple names.

### Decorative Frame

Purpose: provide rope/floral framing around major screens.

Variants:

- Top rope.
- Corner floral.
- Bottom texture.
- Subtle divider.

Rules:

- Decoration must never reduce text contrast.
- Decoration must not interfere with controls.

## Form Components

### Photo Uploader

Purpose: select or capture a guest photo.

States:

- Empty.
- Hover/focus.
- File selected.
- Invalid file.
- Uploading.
- Failed.
- Event closed.
- Retry available.

Content:

- Upload icon.
- Instruction text.
- Accepted file hint.
- Replace action after selection.

### Photo Preview

Purpose: show selected image before submission.

Features:

- Cropped preview.
- Replace action.
- Remove action if needed.
- Orientation handling.

### Message Textarea

Purpose: collect guest message.

States:

- Empty.
- Focused.
- Filled.
- Too long.
- Error.

### Guest Name Input

Purpose: optional attribution.

Guidance:

- Label clearly as optional.
- Do not block submission if empty.

### Submit Button

Purpose: complete contribution.

States:

- Default.
- Disabled.
- Loading.
- Success.

## Wall Components

### Memory Card

Purpose: display one guest memory.

Contains:

- Photo.
- Message excerpt.
- Guest name.
- Optional status if admin view.

Variants:

- Public wall card.
- Admin moderation card.
- Featured card.

States:

- Loading image.
- Image failed.
- Newly added.
- Hidden/pending in admin context.

### Memory Grid

Purpose: arrange memories.

Variants:

- Single-column mobile feed.
- Two-column mobile/tablet grid.
- Multi-column desktop wall.
- Display mode carousel/grid.

Behavior:

- Supports initial page and load-more behavior.
- Supports realtime insert without duplicate cards.
- Preserves scroll position when new content arrives.
- Uses display images, not original uploads, for grid cards.

### Memory Detail Modal

Purpose: show enlarged photo and full message.

Contains:

- Close action.
- Large image.
- Full message.
- Guest name.

## Feedback Components

### Success Confirmation

Purpose: confirm successful submission.

Contains:

- Success mark.
- Confirmation copy.
- View wall action.
- Share another action.

Variants:

- Instant publish success.
- Review-first received state.

### Empty State

Purpose: guide first contribution.

Variants:

- Empty Love Wall.
- No pending moderation.
- No approved memories yet.

### Error Message

Purpose: help users recover.

Rules:

- Explain what happened.
- Explain what to do next.
- Avoid technical details.

Variants:

- Missing photo.
- Missing message.
- Unsupported file.
- File too large.
- Upload failed.
- Network unavailable.
- Event closed.
- Event not found.

## Navigation Components

### Floating Share Button

Purpose: keep contribution accessible from the Love Wall.

Rules:

- Must not cover important card content.
- Must respect safe areas on mobile.

### Compact Event Header

Purpose: preserve event identity outside hero.

Contains:

- Couple names.
- Small title or mark.
- Optional back action.

## Admin Components

### Moderation Tabs

Purpose: filter submissions by status.

Tabs:

- Pending.
- Approved.
- Hidden.

### Moderation Actions

Purpose: approve, hide, or delete memory submissions.

Rules:

- Destructive delete should confirm.
- Approval should be fast.
- Hidden content should be recoverable if possible.

### QR Code Panel

Purpose: present event link and QR code.

Contains:

- QR preview.
- Event URL.
- Download button.
- Print guidance.

### Emergency Event Controls

Purpose: protect a live event quickly.

Contains:

- Close submissions toggle/action.
- Hide public wall action if future policy allows.
- Quick link to recent submissions.
- Clear confirmation for destructive or disruptive actions.
