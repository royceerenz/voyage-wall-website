# Animation Guidelines

## Motion Personality

Motion should feel soft, romantic, and calm. Voyage Wall is used during an emotional event, so animation should support delight without getting in the way.

## Principles

### Gentle

Use subtle fades, lifts, and scale changes. Avoid flashy movement.

### Fast Enough

Interactions should feel immediate. Decorative motion should not delay form completion.

### Meaningful

Use animation to explain state changes:

- A memory was added.
- Upload is in progress.
- Submission succeeded.
- A modal opened or closed.

### Respectful

Support reduced motion preferences.

## Recommended Durations

- Button press feedback: 100-160ms.
- Form state transition: 160-220ms.
- Modal open/close: 180-260ms.
- New memory entrance: 240-400ms.
- Hero decorative drift, if used: very slow and optional.

## Easing

Use soft ease-out curves for entrances and standard ease-in-out for state transitions.

Avoid bouncy spring effects unless carefully tuned and brand-appropriate.

## Key Interactions

### Primary Button

On press:

- Slight scale down.
- Subtle highlight/glow.
- Immediate loading state after submit.

### Photo Selection

When image appears:

- Fade in.
- Slight upward lift.
- Avoid aggressive zoom.

### Uploading

Use calm progress:

- Spinner or progress bar.
- Text update.
- Disabled submit button.

### Success

Use a brief confirmation:

- Soft check/heart appearance.
- Optional light shimmer.
- No long confetti by default.

### New Memory On Wall

When a memory is added:

- Fade in.
- Slight lift.
- Optional soft border glow for a moment.

## Avoid

- Constant pulsing CTAs.
- Large parallax that hurts readability.
- Long transitions between form steps.
- Motion that shifts layout unexpectedly.
- Autoplay effects that distract from guest photos.

## Reduced Motion

When reduced motion is enabled:

- Replace movement with opacity changes.
- Disable decorative drifting.
- Avoid scroll-linked animation.
- Keep all state changes clear without motion.
