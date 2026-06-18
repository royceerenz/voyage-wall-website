# User Flow

## Primary Guest Flow

### Entry

1. Guest scans QR code at the wedding venue.
2. Browser opens the couple-specific Voyage Wall URL.
3. Guest lands on the welcome screen.
4. Guest sees couple/event branding and the primary CTA: "Share a Memory".

### Share Memory

1. Guest taps "Share a Memory".
2. Upload screen opens.
3. Guest chooses one of:
   - Take a photo.
   - Choose from photo library.
4. Guest previews selected image.
5. Guest optionally replaces the image.
6. Guest writes a short message.
7. Guest optionally adds their name.
8. Guest taps submit.

### Submission

1. System validates photo and message.
2. System creates the memory record with a pending upload state.
3. System compresses or prepares the photo if needed.
4. System uploads the image.
5. System marks the memory as approved or pending based on event moderation mode.
6. System displays a success confirmation.
7. Guest is invited to view the Love Wall or share another memory.

### Love Wall

1. Guest views a grid or masonry wall of shared memories.
2. Newly submitted memory appears with a gentle entrance animation when instant publishing is enabled.
3. Guest can scroll through photos and messages.
4. Guest can open a memory detail view if included in MVP.

## Happy Path

QR scan -> Welcome -> Share Memory -> Select Photo -> Add Message -> Submit -> Success -> Love Wall.

## MVP Publishing Modes

### Instant Publish

Used for the first private wedding launch unless the couple requests review-first moderation.

1. Guest submits memory.
2. Memory is saved as approved.
3. Success screen says: "Your memory has joined the wall."
4. Love Wall receives or fetches the new memory.

### Review First

Used when the couple wants tighter control.

1. Guest submits memory.
2. Memory is saved as pending.
3. Success screen says: "Your memory was received and will appear after review."
4. Admin approves the memory.
5. Love Wall displays the approved memory.

## Fast Path

For repeat contributors:

Love Wall -> Floating "Share" button -> Upload -> Submit -> Return to current wall position.

## Error Paths

### No Photo Selected

Prompt guest to add a photo before submitting.

### Unsupported File

Explain accepted formats in plain language: JPG, PNG, HEIC where supported.

### File Too Large

Attempt compression first. If still too large, ask guest to choose a smaller photo.

### Upload Fails

Keep the selected photo and message locally during the session. Offer "Try Again".

### Duplicate Submission

Disable submit while upload is in progress. If a retry creates uncertainty, show the latest known state and avoid creating duplicate wall cards.

### Offline Or Weak Network

Show a calm network message and allow retry. If future offline queueing is implemented, store pending submission locally.

### Event Closed

If submissions are no longer open, show the Love Wall and explain that sharing has closed for this event.

### Event Not Found

Show a branded error page that says the link may be incorrect or expired. Do not expose internal IDs.

### Moderation Pending

If moderation is enabled, tell guests: "Your memory was received and will appear shortly."

## Couple/Admin Flow

### Event Setup

1. Admin creates event.
2. Admin adds couple names.
3. Admin chooses wedding date and visual theme.
4. Admin uploads hero photo or selects default visual treatment.
5. System generates event URL and QR code.

### Moderation

1. Admin opens moderation view.
2. Admin sees pending memories.
3. Admin approves, hides, or deletes submissions.
4. Approved memories appear on Love Wall.

### Post-Event

1. Couple opens archive.
2. Couple reviews all memories.
3. Couple downloads images and messages.
4. Future option: export keepsake PDF or gallery.

## Public Display Flow

Optional wedding-screen mode:

1. Organizer opens display URL on projector or TV.
2. Love Wall cycles through approved memories.
3. New memories appear with a tasteful transition.
4. Display mode avoids form controls and admin features.

## Key UX Requirements

- Guest contribution must not require login.
- The main CTA must be visible in the first screen.
- Submission state must be obvious.
- Guests should not lose their message if an upload fails.
- Success should feel celebratory but brief.
- Love Wall should still be useful with zero memories, a few memories, or many memories.
- Publishing mode must be clear before and after submission.
- Guests should be able to return from the upload flow to the Love Wall without losing orientation.
- The first memory should feel special instead of exposing an empty product.
