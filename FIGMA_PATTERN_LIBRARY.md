# Figma Pattern Library

## Purpose
- Store reusable observations from completed screens.
- Convert recurring Figma patterns into project-specific implementation rules.
- Reduce drift on later screens by reusing the same structure, spacing, and interaction patterns.

## Current Patterns

### Hero
- Large headline
- Supporting text block
- CTA button
- Decorative media cluster or illustration

### Stats Grid
- Four equal columns on desktop
- Two columns on tablet when needed
- Single column stacking on mobile when needed
- Numbers are primary visual emphasis
- When the export shows a fixed screen frame, keep the section height/min-height aligned to that frame rhythm
- Use weight and scale that keep the numbers visually dominant but not overly bold

### Quote / Testimonial Card
- Soft gradient or tinted panel
- Left-aligned body text
- Large decorative quote mark on the bottom-right
- Rounded corners and generous internal padding
- Keep the body copy narrow enough at desktop width to preserve the reference line breaks
- Preserve the empty lower/right breathing room even when the card itself is visually compact

### What is Neuro Screen Frame
- Desktop screen 02 uses a 1200x1000 frame rhythm
- Four stat cells sit above a soft quote card with a five-line testimonial at desktop width
- The section should remain code-based and not collapse into an image substitute
- Preserve the large white bottom region below the quote card when matching the export

### Section Titles
- Large, left-aligned title
- Tight vertical rhythm to the content below
- No decorative wrappers unless the reference shows them

### Content Card Rail
- Repeated cards arranged in a horizontal or grid-like flow
- Each card keeps its own image/media block, title, and supporting copy
- Reuse the same spacing rhythm between cards across sections

### FAQ Accordion
- Stacked question rows with one expanded answer at a time
- Plus/minus or toggle icon on the right edge
- Expanded state increases item height without changing the overall width

### Footer Link Matrix
- Multiple compact link groups in columns
- Small section labels with short link lists beneath
- Divider line above legal/payment metadata

### Free Learning Polygon
- Local manifest/spec/queue/plan generation is the primary learning loop when export bundles are already present
- Codex is not required for observation or hypothesis generation
- Telegram receives the report, queue state, and next actions as the operator UI
- Promotion happens only after local verification and reusable lesson capture

### Live Browser Export Package
- When Figma MCP is quota-limited, the live browser session is the first extraction layer after the UI is confirmed reachable
- Keep browser-captured metadata, screenshots, and local manifest outputs in `H:\Nebula\GPT\figma-export\<timestamp>\`
- Use a normalized package builder so manifest, screen specs, learning logs, and reference exports land in one handoff bundle
- If native export remains blocked, keep the blocker in the package and continue with the local fallback manifest instead of stalling

## How to Add a New Pattern
- When a screen repeats across multiple exports, add:
  - pattern name
  - visual rules
  - layout rules
  - responsive rules
  - do-not-change notes

## Update Rule
- After every finished screen:
  - add one JSONL lesson entry
  - update this library if the screen introduces a reusable pattern
  - reread this file before the next screen
