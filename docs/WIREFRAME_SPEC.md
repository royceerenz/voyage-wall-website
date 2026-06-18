# Wireframe Specification

## Global Layout Assumptions

- Mobile-first.
- Guest pages should fit common phone widths from 320px to 430px.
- Desktop should gracefully center or expand the Love Wall, but the primary event interaction is mobile.
- All major actions should be reachable with one thumb.
- Layouts must account for iOS Safari browser chrome and safe areas.
- No core CTA should sit flush against the bottom edge without safe-area padding.

## Screen 1: Welcome / Hero

### Purpose

Emotionally introduce the wedding and drive guests to contribute.

### Layout

Top to bottom:

1. Decorative nautical artwork framing the top edge.
2. Couple/event label.
3. Large script "Voyage Wall" title.
4. Short invitation: "Share your wedding moments with us".
5. Primary pill CTA: "Share a Memory".
6. Hero image of couple or wedding setting.
7. Bottom hint: "Scroll to view shared moments".

### Requirements

- CTA must remain visually dominant.
- Text must stay readable over photography.
- Decorative assets must never cover the CTA.
- Hero should support the provided deep blue overlay style.

## Screen 2: Share Memory Form

### Purpose

Collect photo, message, and optional guest name.

### Layout

Top to bottom:

1. Compact event header.
2. Progress-like prompt: "Share a memory for Ella & Zyrus".
3. Photo upload area.
4. Selected photo preview.
5. Message textarea.
6. Optional name input.
7. Submit button.
8. Small note about appearing on the Love Wall.
9. Privacy note: "Memories may be visible to anyone with this event link."

### Upload Area States

- Empty.
- Drag/drop where desktop supports it.
- Camera/photo library prompt on mobile.
- Preview selected.
- Replacing selected.
- Invalid file.
- Uploading.
- Upload failed.

### Message Field

- Short prompt.
- Character limit recommendation: 280 characters.
- Friendly helper copy.
- Remaining count if it does not add clutter.

## Screen 3: Submission Success

### Purpose

Confirm that the guest contribution was received.

### Layout

1. Success icon or soft celebration mark.
2. Message: "Your memory has joined the wall."
3. Optional preview card.
4. Primary action: "View Love Wall".
5. Secondary action: "Share Another Memory".

### Requirements

- Avoid a long blocking celebration.
- Keep the user close to the wall.
- If moderation is enabled, wording should say the memory will appear shortly.
- Show the submitted memory preview only after the upload is known to be saved.

## Screen 4: Love Wall

### Purpose

Display shared wedding memories.

### Layout

1. Header with couple/event identity.
2. Optional compact title.
3. Floating or fixed "Share" action.
4. Memory grid/feed.
5. Empty/loading/error states.

### Wall Layout Options

#### MVP Recommended

Single-column mobile feed with optional two-column layout on wider phones/tablets. Load newest approved memories first.

Initial page size should be decided before build. Recommended default: 12 memories on first mobile load, then load more in batches.

#### Later Enhancement

Masonry grid with balanced image heights and cinematic detail view.

### Card Content

- Photo.
- Message excerpt.
- Guest name.
- Optional timestamp or "From the celebration".

### Realtime Behavior

- New memories should appear at the top or in a clearly defined new-memory area.
- Do not push the user's current reading position down unexpectedly.
- If the user is scrolled away from the top, show a small "New memories" affordance instead of auto-jumping.

## Screen 5: Memory Detail

### Purpose

Let guests and couple view a memory more closely.

### Layout

1. Full-width image.
2. Message below image.
3. Guest name.
4. Close/back action.

### Requirements

- Must be easy to close.
- Should not trap users.
- Should support vertical and horizontal photos.

## Screen 6: Empty Love Wall

### Purpose

Encourage first contribution.

### Layout

1. Gentle empty state illustration or decorative texture.
2. Copy: "Be the first to share a memory."
3. Primary CTA: "Share a Memory".

## Screen 7: Admin Moderation

### Purpose

Approve, hide, or delete memories.

### Layout

1. Admin header.
2. Filter tabs: Pending, Approved, Hidden.
3. Submission list or grid.
4. Approve/hide/delete controls.

### Requirements

- Prioritize clarity over decoration.
- Show enough image and message context for confident moderation.
- Make destructive actions confirmable.

## Screen 8: Event Closed

### Purpose

Handle expired or intentionally closed submission windows.

### Layout

1. Event identity.
2. Message that sharing is closed.
3. Primary action to view the Love Wall.

## Screen 9: Event Not Found

### Purpose

Handle incorrect, expired, or unavailable links gracefully.

### Layout

1. Branded Voyage Wall mark/title.
2. Plain message that the event link could not be found.
3. Optional instruction to check the QR code or ask the couple/organizer.
