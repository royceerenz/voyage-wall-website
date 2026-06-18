# Design System

## Design Direction

Voyage Wall should feel like a premium digital keepsake for a romantic coastal wedding. The visual language is inspired by the provided draft design: deep navy overlays, soft beach imagery, white elegant typography, rope and floral details, and a large rounded call-to-action.

## Mood Keywords

- Nautical.
- Romantic.
- Premium.
- Soft.
- Celebratory.
- Serene.
- Personal.

## Color Palette

### Core Colors

- Deep Voyage Navy: `#17304A`
- Midnight Blue: `#10243A`
- Harbor Blue: `#284866`
- Mist Blue: `#A9BED0`
- Sea Foam Tint: `#D8E4EC`
- Warm White: `#F8FAFC`

### Accent Colors

- Pearl Highlight: `#EAF3FA`
- Soft Silver: `#CAD6E0`
- Champagne Sand: `#E8DDCF`
- Blush Shell: `#E9CFCB`

### Usage

- Use deep navy for hero overlays, header surfaces, and primary emotional framing.
- Use warm white for main text on dark backgrounds.
- Use mist blue for secondary text, borders, dividers, and inactive states.
- Use champagne or blush accents sparingly for romantic warmth.

## Typography

### Display Script

Purpose: product title, couple names, special keepsake moments.

Desired quality:

- Elegant handwritten script.
- High contrast strokes.
- Wedding invitation feel.
- Readable at large sizes only.

Potential font direction:

- Great Vibes.
- Allura.
- Cormorant Garamond Italic as a fallback if script readability becomes an issue.

### Primary Sans

Purpose: interface text, buttons, forms, captions, labels.

Desired quality:

- Clean.
- Soft geometry.
- Modern.
- High legibility on mobile.

Potential font direction:

- Poppins.
- Avenir-like.
- Inter with softened weights.

### Editorial Serif

Purpose: optional section headings or couple story moments.

Desired quality:

- Refined.
- Romantic.
- Clear.

Potential font direction:

- Cormorant Garamond.
- Playfair Display.

## Type Scale

- Hero script title: 64-84px mobile visual equivalent, adjusted for viewport.
- Couple label: 18-22px.
- Hero supporting text: 26-34px.
- Primary button: 24-34px.
- Section heading: 28-40px.
- Body text: 16-18px.
- Metadata/caption: 13-15px.

Final implementation should use responsive clamps, but avoid oversized text that clips on narrow phones.

## Spacing System

- Base unit: 4px.
- Common spacing: 8, 12, 16, 24, 32, 48, 64.
- Mobile side padding: 20-24px.
- Form field vertical spacing: 16-20px.
- Card spacing: 16-24px.
- Section spacing: 48-72px.

## Shape And Radius

- Primary buttons: pill radius.
- Memory cards: 8-16px radius depending on final visual density.
- Inputs: 12-16px radius.
- Modal/dialog surfaces: 16px radius.
- Avoid overly playful bubble shapes; the tone should stay premium.

## Shadows And Depth

Use depth sparingly.

Recommended:

- Soft button glow on dark navy.
- Subtle card shadow for memory tiles.
- Gradient overlays over photography.
- Thin light borders for glassy nautical surfaces.

Avoid:

- Heavy drop shadows.
- Neon effects.
- Generic glassmorphism that hurts readability.

## Imagery

### Hero Photography

The first screen should show the couple or wedding atmosphere clearly. For the draft design, beach photography anchors the emotional story.

Image guidance:

- Use real wedding or couple photography where available.
- Crop around people with enough negative space for text.
- Apply navy overlay for brand consistency and readability.
- Avoid stock imagery that feels unrelated to the actual couple.

### Decorative Assets

Planned decorative motifs:

- Rope linework.
- Nautical knots.
- Soft florals.
- Anchor or ring-adjacent details if tasteful.
- Paper or fabric texture.
- Ocean mist overlays.

Decorations should frame the content without blocking primary actions.

## Iconography

Icons should be simple line icons with rounded ends.

Planned icon uses:

- Camera/upload.
- Image gallery.
- Message.
- Heart.
- Check/success.
- Warning/error.
- Lock/privacy.
- Refresh/loading.

## Voice And Copy

The product should sound personal and gracious.

Preferred phrases:

- "Share a Memory"
- "Add your message"
- "Upload a photo"
- "Your memory has joined the wall"
- "Your memory was received and will appear after review"
- "Scroll to view shared moments"
- "Thank you for being part of our voyage"
- "Memories may be visible to anyone with this event link"

Avoid:

- Technical upload jargon.
- Corporate dashboard language.
- Anything that makes guests feel monitored or judged.

## Layout Personality

The interface should feel cinematic on first load, then practical during upload.

- Hero: immersive, emotional, photographic.
- Upload flow: calm, clear, guided.
- Love Wall: celebratory, browsable, image-led.
- Admin/moderation: restrained and efficient.
