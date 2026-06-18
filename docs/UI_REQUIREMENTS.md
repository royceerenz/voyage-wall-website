# UI Requirements

## General Requirements

- The interface must be mobile-first.
- Primary guest actions must be visually obvious.
- The product must work without account creation for guests.
- All form states must include clear feedback.
- Copy should be warm and concise.
- Controls should be large enough for wedding-day use on phones.

## Responsive Requirements

### Mobile

- Primary target.
- Single-column flows.
- Sticky or highly visible primary actions where helpful.
- Touch targets at least 44px tall.

### Tablet

- Allow wider image previews and two-column wall layouts.
- Keep upload flow focused and not overly stretched.

### Desktop

- Love Wall can use a richer grid.
- Upload flow should remain centered and compact.
- Display mode should support projector or TV layouts in a future phase.

## Welcome Screen Requirements

- Must include couple/event identity.
- Must include "Voyage Wall" title treatment.
- Must include "Share a Memory" primary CTA.
- Must include scroll cue or visible continuation into Love Wall.
- Must preserve readability over hero imagery.

## Upload Requirements

- Allow photo selection from device.
- Support camera capture where browser/device allows.
- Preview selected photo before submission.
- Allow replacement before submission.
- Validate image type.
- Validate reasonable file size.
- Show upload progress or clear loading state.
- Prevent duplicate accidental submissions.
- Preserve message text during upload retry where possible.
- Create an explicit state for event closed, upload unavailable, and moderation pending.
- Use a retry pattern that does not clear selected image or typed message.
- Show a clear privacy note before submission: memories may be visible to anyone with the event link.

## Message Requirements

- MVP: message required, guest name optional.
- Character limit should be short enough for wall display.
- Validation must use human language.
- Recommended message limit: 280 characters.
- Recommended guest name limit: 40 characters.

## Love Wall Requirements

- Must handle empty state.
- Must handle loading state.
- Must handle failed loading state.
- Must handle few memories without looking broken.
- Must handle many memories without becoming slow.
- New memory appearance should be visually noticeable but not distracting.
- Must use incremental loading or pagination once approved memories exceed the first page.
- Must lazy-load images and avoid loading originals in grid cards.
- Must handle realtime updates gracefully if multiple guests submit at once.
- Must avoid jumping the scroll position when new memories arrive.

## State Requirements

### Loading

Use calm loading language:

- "Preparing your memory..."
- "Adding this to the wall..."

### Success

Use celebratory language:

- "Your memory has joined the wall."
- Review-first variant: "Your memory was received and will appear after review."

### Error

Use repair-oriented language:

- "This photo did not upload. Please try again."
- "Please add a photo before sharing."

## Privacy And Safety Requirements

- Guest submissions should be treated as public within the event.
- The UI should clearly indicate whether memories appear instantly or after approval.
- Admin controls should support hiding/removing content.
- Do not expose raw storage paths in user-facing UI.
- Do not show guest IP, device, or operational metadata in public UI.
- Rate limiting or equivalent abuse protection is required before public use.
- The event must have an operational way to close submissions.

## Performance Requirements

- Optimize hero and decorative assets.
- Compress uploaded images where possible.
- Lazy-load wall images.
- Use responsive image sizes.
- Avoid heavy animations during upload.
- Use display-sized images for cards and reserve original images for exports/downloads.
- Define an initial Love Wall page size before build.
- Avoid loading more than the first page of wall images on initial mobile load.

## Realtime Requirements

- Instant publish mode should show newly approved memories without a manual refresh when feasible.
- Realtime updates should be additive and calm, not disruptive.
- If realtime is unavailable, polling or manual refresh copy is acceptable for MVP.
- The wall should never duplicate the same memory after reconnecting.

## Content Requirements

Minimum guest-facing copy:

- Event/couple name.
- Invitation line.
- Upload instructions.
- Message prompt.
- Submission confirmation.
- Empty state.
- Error states.

## Browser Requirements

Target modern mobile browsers:

- iOS Safari.
- Chrome on Android.
- Chrome/Edge desktop for admin and testing.

Older browsers should degrade gracefully where possible.
