# Project Brief

## Product Name

Voyage Wall

## One-Line Description

A premium wedding memory wall where guests scan a QR code, upload a photo, leave a message, and instantly see their memory appear on a shared Love Wall.

## Product Promise Clarification

"Instantly" means the guest receives immediate confirmation and, when the event is configured for instant publishing, the memory appears on the Love Wall without a manual refresh. If the event uses review-first moderation, the guest still receives immediate confirmation, but the UI must say the memory will appear after approval.

## Product Vision

Voyage Wall turns scattered wedding-day moments into a living digital keepsake. Instead of asking guests to send photos through private chats, social media, or a shared drive after the event, the couple gives everyone one simple ritual: scan, share, and watch the celebration grow in real time.

## Target Audience

### Primary Users

Wedding guests using mobile phones during the event.

They may be:

- Young friends comfortable with mobile sharing.
- Parents and relatives who need a simple, forgiving interface.
- Guests on weak venue Wi-Fi or cellular networks.
- People with only a few seconds between ceremony, reception, and social moments.

### Secondary Users

The couple and wedding organizers.

They need:

- A polished experience that matches the wedding aesthetic.
- A reliable memory collection workflow.
- Optional moderation or review.
- A post-event archive of photos and messages.

## Core Problem

Wedding memories are fragmented across phones, chats, stories, and private albums. Couples often struggle to gather guest photos after the event, and guests forget to send them once the celebration ends.

## Product Solution

Voyage Wall creates a shared destination for wedding memories during the event. A QR code brings every guest into a branded, couple-specific experience where contribution is fast and emotionally rewarding.

## Primary Goals

- Make guest sharing feel effortless.
- Make the Love Wall feel premium and personal.
- Encourage more guest participation through immediate visual feedback.
- Preserve the couple's memories in one organized place.
- Avoid technical friction like accounts, app downloads, or long forms.
- Protect the couple's event from spam, inappropriate content, and accidental public uploads.

## Non-Goals For MVP

- Full social network behavior.
- Complex user profiles.
- Public discovery of other weddings.
- Multi-event enterprise dashboard.
- Advanced photo editing.
- Payment or package management.

## Brand Personality

- Romantic.
- Refined.
- Warm.
- Oceanic.
- Celebratory.
- Calm under pressure.

## Experience Principles

### One Gesture Away

The main action should always be obvious. Guests should never wonder where to tap next.

### Premium, Not Precious

The design should feel elegant and wedding-worthy without making the flow slow or fragile.

### Designed For The Event

The interface must work in crowded rooms, outdoors, low light, bright sunlight, and imperfect network conditions.

### Emotional Reward

Submitting a memory should feel like contributing to the couple's story, not filling out a form.

## Success Metrics

- Percentage of guests who submit at least one memory.
- Average time from QR scan to successful submission.
- Upload completion rate.
- Number of memories collected per event.
- Couple satisfaction with final Love Wall.
- Rate of failed uploads or abandoned forms.
- Median Love Wall load time on mobile.
- Percentage of memories successfully processed into display-ready images.
- Number of hidden/deleted submissions per event.

## Key Risks

- Large image uploads fail on mobile networks.
- Guests submit inappropriate or accidental content.
- The wall becomes visually noisy.
- Older guests struggle with file permissions or camera access.
- The experience feels generic instead of custom to the couple.
- Public event URLs are shared beyond invited guests.
- The Love Wall slows down as submissions grow.
- A guest submits the same memory repeatedly after tapping twice or retrying.
- Private couple imagery or guest-submitted content is exposed through overly broad storage rules.

## MVP Hypothesis

If guests can share a memory in under one minute and see it appear immediately in a beautiful shared wall, more wedding memories will be captured during the event and the couple will value the result as a keepsake.

## MVP Default Decisions

- Publishing mode: instant publish for the first private event, with moderation-ready status fields and an emergency hide/delete path.
- Guest identity: optional display name only; no guest accounts.
- Required fields: photo and message.
- Guest privacy: guest submissions are visible to anyone with the event link unless the event is configured differently later.
- Post-event export: planned but not required for first build.
