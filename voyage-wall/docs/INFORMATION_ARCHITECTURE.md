# Information Architecture

## Site Model

Voyage Wall is organized around an event. Each wedding has a unique public guest experience and a private operational/admin experience.

## Public Guest Pages

### Welcome

Purpose: introduce the couple/event and drive guests to share a memory.

Primary content:

- Couple/event label.
- Voyage Wall title.
- Short invitation copy.
- Primary CTA.
- Preview of the Love Wall or emotional hero image.

### Share Memory

Purpose: collect one photo and message from a guest.

Primary content:

- Photo picker.
- Image preview.
- Message field.
- Optional guest name.
- Submit button.
- Validation and upload states.

### Love Wall

Purpose: display submitted memories in a beautiful shared layout.

Primary content:

- Event header.
- Memory grid/feed.
- Empty state.
- New memory state.
- Floating share action.
- Pagination or incremental loading once memory count grows.

### Memory Detail

Purpose: show one memory more intimately.

Primary content:

- Large photo.
- Message.
- Guest name.
- Time or event label.
- Close/back action.

This can be deferred if the MVP wall cards already show enough detail.

## Private/Admin Pages

Admin pages are part of the product architecture, but the first MVP can begin with minimal private tooling if a direct operational process is approved. The public guest flow must not depend on a full dashboard existing.

### Event Setup

Purpose: configure event identity and visual settings.

Primary content:

- Couple names.
- Wedding title.
- Event date.
- Hero image.
- Theme selection.
- Moderation setting.

### QR Code

Purpose: provide the couple or organizer with the guest entry point.

Primary content:

- Event URL.
- QR code preview.
- Download options.
- Print guidance.

### Moderation Queue

Purpose: review submitted memories before public display.

Primary content:

- Pending submissions.
- Approve action.
- Hide/delete action.
- Reported content if future feature exists.

### Emergency Controls

Purpose: allow a trusted operator to quickly protect the event.

Primary content:

- Close submissions.
- Hide Love Wall public display if needed.
- Hide/delete a specific memory.
- Copy event URL and QR destination for troubleshooting.

### Archive

Purpose: preserve event memories after the wedding.

Primary content:

- All approved memories.
- Download/export controls.
- Filter by date, guest, or status in later versions.

## Navigation Principles

### Guest Navigation

Keep guest navigation minimal.

Core actions:

- Share a Memory.
- View Love Wall.
- Back/close from modal or detail view.

Avoid full nav menus in the MVP guest experience.

### Admin Navigation

Admin can use a simple tabbed or sidebar structure:

- Setup.
- QR Code.
- Moderation.
- Memories.
- Settings.

## Content Hierarchy

### Guest Welcome

1. Couple/event identity.
2. Product title.
3. Emotional invitation.
4. Primary CTA.
5. Love Wall hint.

### Upload Form

1. Add photo.
2. Add message.
3. Add name.
4. Submit.
5. Privacy/moderation note.

### Love Wall

1. Current event identity.
2. Share action.
3. Memory content.
4. Empty/loading/error states.

## URL Planning

Potential URL structure:

- `/e/{eventSlug}`: welcome screen with Love Wall preview.
- `/e/{eventSlug}/share`: upload flow.
- `/e/{eventSlug}/wall`: shared memories.
- `/e/{eventSlug}/memory/{memoryId}`: memory detail.
- `/admin/{eventId}`: admin overview.
- `/admin/{eventId}/moderation`: moderation queue.

## Access Model

- Guest URLs are public-but-obscure event links intended for invited guests.
- Guests do not authenticate in the MVP.
- Admin URLs require authentication before any event, memory, storage, or moderation data is shown.
- Event slugs should be readable enough for event use but not the only security boundary.
- Future private events may require a shared passcode.

Final routes should be chosen when the implementation framework is selected.
