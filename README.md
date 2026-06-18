# Voyage Wall

Voyage Wall is a premium wedding memory wall website where guests scan a QR code, upload a photo, leave a message, and see their memory appear on a shared Love Wall. In instant publish mode, approved memories appear right away; in review-first mode, guests receive immediate confirmation and the memory appears after approval.

The product is designed for wedding-day use: fast, emotional, mobile-first, and easy enough for guests of any age to use without creating an account.

## Product Promise

Guests should be able to share a wedding memory in less than one minute.

The couple should receive a beautiful, living collection of guest photos and messages that feels curated, intimate, and worthy of the event.

## Core Experience

1. Guest scans the venue QR code.
2. Guest lands on the Voyage Wall welcome screen.
3. Guest taps "Share a Memory".
4. Guest uploads or captures a photo.
5. Guest writes a short message.
6. Guest submits the memory.
7. Memory appears on the shared Love Wall immediately or after approval, depending on the event publishing mode.

## Current Status

This repository now contains the planning documentation and a self-contained static frontend prototype.

The frontend is intentionally static and uses mock memory data. Supabase integration has not been implemented yet.

## Run Locally

From the `voyage-wall` folder:

```bash
node local-server.cjs
```

Then open:

```text
http://127.0.0.1:4173
```

You can also open `index.html` directly in a browser, but the local server is closer to how the site will run when hosted.

## Planned Structure

```text
voyage-wall/
|-- AGENTS.md
|-- README.md
|-- docs/
|-- assets/
|-- src/
`-- supabase/
```

## Documentation Map

- `docs/PROJECT_BRIEF.md`: product vision, audience, goals, and success criteria.
- `docs/DESIGN_SYSTEM.md`: visual direction, colors, typography, spacing, imagery, and tone.
- `docs/USER_FLOW.md`: end-to-end guest and admin journeys.
- `docs/INFORMATION_ARCHITECTURE.md`: site structure, screens, and content hierarchy.
- `docs/WIREFRAME_SPEC.md`: screen-by-screen layout specifications.
- `docs/LOW_FIDELITY_WIREFRAMES.md`: block-level low-fidelity specs for sections and components.
- `docs/UI_REQUIREMENTS.md`: interaction, responsive, form, and state requirements.
- `docs/COMPONENT_LIBRARY.md`: planned UI components and responsibilities.
- `docs/ANIMATION_GUIDELINES.md`: motion principles and interaction animation rules.
- `docs/ACCESSIBILITY.md`: accessibility goals and implementation requirements.
- `docs/MVP_SCOPE.md`: launch boundaries and exclusions.
- `docs/FUTURE_ROADMAP.md`: post-MVP expansion ideas.
- `docs/DOCUMENTATION_REVIEW.md`: issues found during planning review and the fixes applied.
- `supabase/schema.sql`: commented database schema planning draft.
- `supabase/storage-structure.md`: storage bucket and asset organization plan.

## Frontend Map

- `index.html`: main static frontend entry.
- `src/css/styles.css`: responsive visual system and layout.
- `src/js/app.js`: guest flow interactions, mock memory wall behavior, and operator controls.
- `assets/mockups/`: project-local generated imagery used by the prototype.
- `local-server.cjs`: lightweight local server for previewing the site.

## Design Direction

Voyage Wall should feel like a digital keepsake rather than a generic upload form. The current direction is premium nautical wedding:

- Deep navy and mist blue palette.
- Elegant white typography.
- Script title treatment for the product name.
- Soft beach photography.
- Rope, floral, and ocean-inspired decorative details.
- Large, tactile rounded CTA buttons.

## MVP North Star

The MVP succeeds if wedding guests can quickly contribute memories, the couple can view a beautiful shared wall, and a trusted operator can protect the event if something needs to be hidden or submissions need to close.
