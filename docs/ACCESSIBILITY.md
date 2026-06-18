# Accessibility

## Accessibility Goal

Voyage Wall should be usable by wedding guests of varying ages, devices, abilities, and comfort levels. Accessibility is part of the guest experience, not a later polish step.

## Standards Target

Aim for WCAG 2.2 AA where practical for the MVP.

## Core Requirements

- Text must meet contrast requirements over images and gradients.
- Buttons and inputs must be keyboard accessible.
- Focus states must be visible.
- Forms must have labels.
- Errors must be announced and tied to fields.
- Images need meaningful alt text where user-facing.
- Decorative images should be ignored by assistive technology.
- Motion must respect reduced motion preferences.
- Dynamic Love Wall updates must be announced carefully or not at all if announcements would become noisy.

## Color Contrast

Deep navy and white is the primary readable pairing.

Rules:

- Never place small white text directly over busy photography without overlay.
- Use gradient overlays for hero images.
- Validate button text contrast in all states.
- Disabled states must still be understandable, not just low contrast.

## Touch Accessibility

Wedding guests may be standing, holding drinks, or using one hand.

Requirements:

- Minimum touch target: 44px.
- Primary actions should be easy to reach.
- Avoid small text-only controls for core actions.
- Give enough spacing between destructive and confirm actions.

## Form Accessibility

### Photo Upload

- Label the upload control clearly.
- Explain accepted file types in plain language.
- Provide error messages near the control.
- Do not rely on icon-only instructions.

### Message Field

- Use a visible label.
- Provide character guidance if a limit exists.
- Announce validation errors.

### Submit

- Disable only when necessary.
- Explain what is missing if submit is unavailable.
- Show loading state after activation.

## Screen Reader Considerations

- Page titles should identify the event and current task.
- Success confirmation should be announced.
- Loading states should not chatter excessively.
- Memory cards should have accessible names based on guest name and message.
- Admin moderation actions need clear labels.
- Newly added memories should not steal focus.
- If a "New memories" control appears, it should be keyboard reachable and clearly labeled.

## Keyboard Requirements

Even though guest usage is mobile-first, keyboard support matters for desktop, admin, and accessibility.

- Tab order should follow visual order.
- Modals must trap focus while open.
- Escape should close modals where appropriate.
- Upload, submit, approve, hide, and delete actions must be keyboard operable.

## Motion Accessibility

- Respect reduced motion.
- Avoid flashing effects.
- Avoid scroll hijacking.
- Keep animations decorative rather than required for understanding.

## Content Accessibility

Use plain, supportive language.

Good:

- "Please add a photo before sharing."
- "This upload did not finish. Try again."

Avoid:

- "Invalid input."
- "Error 413."
- "Submission failed due to backend constraint."

## Testing Checklist

- Use mobile screen reader on the guest flow.
- Navigate upload form with keyboard.
- Test high contrast conditions.
- Test narrow phone width.
- Test large text settings.
- Test reduced motion.
- Test failed upload recovery.
- Test dynamic Love Wall updates with assistive technology.
- Test event closed and event not found states.
