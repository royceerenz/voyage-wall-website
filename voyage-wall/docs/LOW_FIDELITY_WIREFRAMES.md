# Low-Fidelity Wireframe Specifications

## Purpose

This document defines low-fidelity structure for every major Voyage Wall section and component before visual design or development begins. It describes hierarchy, placement, content blocks, states, and behavior without prescribing final styling or implementation code.

## Wireframe Legend

- `[Image]`: photo, uploaded memory, illustration, or texture area.
- `[Text]`: heading, label, message, helper copy, or metadata.
- `[Button]`: tappable action.
- `[Input]`: text field, textarea, upload control, or selectable control.
- `[State]`: loading, empty, error, success, or disabled content.
- `[Admin]`: private operator/admin-only control.

## Global Layout Frame

### Mobile Guest Frame

Primary target for the MVP.

```text
[Viewport]
  [Safe top area]
  [Screen content]
  [Primary action area when needed]
  [Safe bottom area]
```

Structure requirements:

- Content uses one primary column.
- Primary actions are easy to reach with one hand.
- No critical action sits under browser chrome or phone safe areas.
- Screens support vertical scrolling.
- Guest flows avoid persistent navigation menus.

### Desktop Guest Frame

Secondary target for viewing and testing.

```text
[Page background]
  [Centered mobile-like content column OR expanded wall layout]
```

Structure requirements:

- Upload flow remains compact and centered.
- Love Wall may expand into multiple columns.
- Guest flow should still feel event-focused, not dashboard-like.

### Admin Frame

Private operational layout.

```text
[Admin header]
[Tabs or sidebar]
[Primary admin workspace]
[Status/action area]
```

Structure requirements:

- Prioritize clarity over decoration.
- Actions must be easy to audit.
- Destructive actions require confirmation.

## Public Guest Sections

## 1. Welcome Hero

### Purpose

Introduce the couple/event and move guests into the share flow.

### Mobile Wireframe

```text
[Full-screen hero section]
  [Decorative top frame]
  [Couple/event label]
  [Large Voyage Wall title]
  [Invitation copy]
  [Primary CTA: Share a Memory]
  [Hero photo / couple photo]
  [Scroll hint]
```

### Content Hierarchy

1. Couple/event identity.
2. Voyage Wall title.
3. Invitation to participate.
4. Share action.
5. Emotional photography.
6. Prompt to view shared moments.

### Requirements

- CTA must be visible without searching.
- Hero photo must not obscure text.
- Decorative frame is secondary and non-interactive.
- If hero photo is missing, show a graceful branded fallback.

### States

- Default with hero photo.
- Missing hero photo.
- Long couple names.
- Event closed variant with share CTA replaced by "View Love Wall".

## 2. Love Wall Preview Section

### Purpose

Show that shared memories exist and encourage scrolling beyond the hero.

### Mobile Wireframe

```text
[Section header]
  [Small title: Shared Moments]
  [Optional count]

[Preview cards]
  [Memory preview card]
  [Memory preview card]
  [Memory preview card]

[Secondary action]
  [Button: View Love Wall]
```

### Requirements

- If memories exist, show a small sample.
- If no memories exist, show the empty wall state instead.
- Do not duplicate the full wall if the main page already continues into the wall.

## 3. Share Memory Screen

### Purpose

Collect one photo, one message, and optional guest name.

### Mobile Wireframe

```text
[Compact event header]
  [Back/View wall link]
  [Couple/event label]

[Form title]
  [Heading: Share a memory]
  [Short helper copy]

[Photo uploader]
  [Upload drop area / camera prompt]
  [Accepted file hint]

[Photo preview area]
  [Selected image]
  [Replace action]
  [Remove action if used]

[Message field]
  [Label]
  [Textarea]
  [Character helper]

[Name field]
  [Label: Your name optional]
  [Input]

[Privacy note]

[Submit area]
  [Primary button]
```

### Requirements

- Photo and message are required for MVP.
- Guest name is optional.
- Privacy note appears before submit.
- Submit button reflects disabled/loading/success states.
- Retry must preserve selected image and typed text when possible.

### States

- Empty form.
- Photo selected.
- Message missing.
- Uploading.
- Upload failed.
- Event closed.
- Network unavailable.

## 4. Submission Success Screen

### Purpose

Confirm the guest contribution and guide them back to the wall.

### Instant Publish Wireframe

```text
[Centered success panel]
  [Success mark]
  [Heading: Your memory has joined the wall]
  [Optional submitted memory preview]
  [Primary button: View Love Wall]
  [Secondary button: Share Another Memory]
```

### Review-First Wireframe

```text
[Centered received panel]
  [Received mark]
  [Heading: Your memory was received]
  [Copy: It will appear after review]
  [Primary button: View Love Wall]
  [Secondary button: Share Another Memory]
```

### Requirements

- Success state must not feel like a dead end.
- Preview appears only after the upload is saved.
- Copy must match publishing mode.

## 5. Love Wall

### Purpose

Display approved memories and keep contribution available.

### Mobile Wireframe

```text
[Compact event header]
  [Couple/event label]
  [Optional memory count]

[Wall intro]
  [Heading: Shared Moments]
  [Short copy]

[New memories affordance when needed]
  [Button: New memories]

[Memory feed]
  [Memory card]
  [Memory card]
  [Memory card]

[Load more area]
  [Button or loading state]

[Floating share action]
```

### Desktop Wireframe

```text
[Event header]
[Wall intro + Share action]
[Responsive grid]
  [Memory card] [Memory card] [Memory card]
  [Memory card] [Memory card] [Memory card]
[Load more area]
```

### Requirements

- Initial mobile load shows a limited batch of newest approved memories.
- New realtime memories do not force-scroll the page.
- Empty, loading, and failed states are part of the same section.
- Floating share action must not cover readable content.

### States

- Loading first page.
- Empty wall.
- Loaded with memories.
- New memories available.
- Loading more.
- Failed to load.

## 6. Empty Love Wall

### Purpose

Make the first contribution feel inviting.

### Wireframe

```text
[Empty state area]
  [Optional illustration/texture]
  [Heading: Be the first to share a memory]
  [Short supportive copy]
  [Primary button: Share a Memory]
```

### Requirements

- Must not feel broken or unfinished.
- CTA must be prominent.
- Empty illustration is optional and decorative.

## 7. Memory Detail

### Purpose

Show one memory more intimately if included after MVP essentials.

### Modal Wireframe

```text
[Overlay]
  [Detail panel]
    [Close button]
    [Large image]
    [Guest name]
    [Full message]
    [Optional timestamp]
```

### Requirements

- Deferred by default for MVP.
- Must be easy to close.
- Must support vertical and horizontal photos.
- Must not trap guests if image fails to load.

## 8. Event Closed Screen

### Purpose

Handle events that no longer accept submissions.

### Wireframe

```text
[Branded event panel]
  [Couple/event label]
  [Heading: Sharing is closed]
  [Copy explaining memories can still be viewed]
  [Primary button: View Love Wall]
```

### Requirements

- Do not show upload controls.
- Keep tone warm, not punitive.
- Preserve access to the Love Wall if wall visibility is enabled.

## 9. Event Not Found Screen

### Purpose

Handle invalid, expired, or mistyped event links.

### Wireframe

```text
[Branded error panel]
  [Voyage Wall mark/title]
  [Heading: We could not find this wall]
  [Copy: Check the QR code or ask the couple/organizer]
```

### Requirements

- Do not expose internal event IDs.
- Do not show admin or debugging details.
- Keep copy plain and calm.

## Form Components

## 10. Compact Event Header

### Wireframe

```text
[Header row]
  [Back or close action]
  [Couple/event label]
  [Optional small action]
```

### Requirements

- Used outside the hero.
- Keeps guests oriented.
- Back action should be text or icon plus accessible label.

## 11. Photo Uploader

### Empty Wireframe

```text
[Upload box]
  [Icon placeholder]
  [Text: Add a photo]
  [Hint: Take a photo or choose from library]
  [Accepted file note]
```

### Selected Wireframe

```text
[Preview box]
  [Selected image]
  [Replace action]
  [Optional remove action]
```

### Error Wireframe

```text
[Upload box with error]
  [Error text]
  [Try again action]
```

### Requirements

- The whole upload area may be tappable.
- File restrictions must be explained in plain language.
- Loading state must prevent duplicate submit attempts.

## 12. Message Textarea

### Wireframe

```text
[Field group]
  [Label: Message for the couple]
  [Textarea]
  [Helper / character count]
  [Error text when needed]
```

### Requirements

- Required in MVP.
- Limit: 280 characters recommended.
- Error message appears near the field.

## 13. Guest Name Input

### Wireframe

```text
[Field group]
  [Label: Your name optional]
  [Single-line input]
  [Helper text if needed]
```

### Requirements

- Optional.
- Limit: 40 characters recommended.
- If blank, memory can display as "A guest" or omit attribution.

## 14. Primary Button

### Wireframe

```text
[Full-width or prominent pill button]
  [Action label]
```

### States

- Default.
- Pressed.
- Disabled.
- Loading.
- Success.

### Requirements

- Label states must be explicit.
- Loading state should say what is happening.
- Disabled state should be paired with validation guidance where possible.

## Wall Components

## 15. Memory Card

### Public Card Wireframe

```text
[Card]
  [Photo]
  [Message excerpt]
  [Guest name or fallback]
```

### Admin Card Wireframe

```text
[Card]
  [Photo]
  [Message]
  [Guest name]
  [Status label]
  [Approve] [Hide/Delete]
```

### Requirements

- Public card uses display-sized image.
- Message excerpt should not overflow the card.
- Image failed state still shows message/name if available.

## 16. Memory Grid / Feed

### Wireframe

```text
[Grid/feed container]
  [Memory card]
  [Memory card]
  [Memory card]
  [Load more state]
```

### Requirements

- Mobile: one column by default.
- Wider screens: two or more columns.
- Initial load: newest approved memories first.
- Load more appears after first batch.

## 17. New Memories Affordance

### Wireframe

```text
[Small floating or inline button]
  [Text: New memories]
```

### Requirements

- Appears when realtime updates arrive while user is away from the top.
- Activating it moves user to the new content intentionally.
- Must not steal focus automatically.

## Feedback Components

## 18. Loading State

### Wireframe

```text
[Loading block]
  [Spinner or progress indicator placeholder]
  [Text explaining current action]
```

### Requirements

- Use specific copy: preparing, uploading, adding to wall, loading memories.
- Avoid indefinite mystery states.

## 19. Error Message

### Wireframe

```text
[Error block]
  [Plain-language error]
  [Recovery action if available]
```

### Requirements

- Explain the problem.
- Explain next step.
- Avoid technical error codes.

## 20. Privacy Note

### Wireframe

```text
[Small note block]
  [Privacy/safety text]
```

### Required Copy Direction

Memories may be visible to anyone with this event link.

### Requirements

- Appears before submission.
- Short enough not to scare guests away.
- Clear enough to avoid surprise.

## Admin And Operator Components

## 21. Admin Overview

### Wireframe

```text
[Admin header]
  [Event name]
  [Event status]

[Quick actions]
  [Close submissions]
  [View QR]
  [Open moderation]

[Summary cards]
  [Total memories]
  [Pending]
  [Approved]
  [Hidden]
```

### Requirements

- Functional polish can come later, but operational controls are required for launch.
- Event status must be obvious.

## 22. Moderation Queue

### Wireframe

```text
[Admin header]
[Tabs: Pending | Approved | Hidden]
[Submission list]
  [Admin memory card]
  [Admin memory card]
  [Admin memory card]
```

### Requirements

- Pending items are easiest to find.
- Approve should be fast.
- Hide/delete should require confirmation or clear intent.

## 23. Emergency Event Controls

### Wireframe

```text
[Emergency controls panel]
  [Close submissions action]
  [Wall visibility status]
  [Recent submissions link]
  [Confirmation area]
```

### Requirements

- Must be authenticated.
- Must explain impact before disruptive changes.
- Must be available before public wedding use.

## 24. QR Code Panel

### Wireframe

```text
[QR panel]
  [QR image placeholder]
  [Event URL]
  [Download QR action]
  [Copy link action]
  [Print guidance]
```

### Requirements

- QR destination must be visible as text.
- Copy action should confirm success.
- Downloaded QR should point to the public event URL.

## Acceptance Checklist

- Every guest screen has default, empty, loading, and error coverage where relevant.
- Upload flow has recovery for failed uploads.
- Publishing mode changes success copy.
- Love Wall supports first batch, load more, and realtime additions.
- Guest privacy note appears before submission.
- Operator controls exist for hiding content and closing submissions.
- No low-fidelity spec depends on final colors, fonts, or code implementation.
