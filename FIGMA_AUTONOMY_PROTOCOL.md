# Figma Autonomy Protocol

## Objective
- Build pages and sections from Figma with minimal human prompting.
- Use Figma as the source of truth.
- Use the approved Neuro Home and release `1.0` as the implementation baseline.
- Verify every change with local rendering before moving on.

## Core Principle
- Do not guess from memory.
- Do not infer hidden details from semantics if the Figma order or export shows the screen explicitly.
- Do not advance to the next screen until the current screen is verified.

## What We Use
- Figma MCP as the primary extraction layer
- Dev Mode / exports as the reference layer
- Local static render + Playwright screenshots as the verification layer
- Existing project code as the implementation layer
- Optional external AI review tools only as a fallback critique layer, not as the primary source of truth

## Live Browser Export Mode
- If Figma MCP is quota-limited, use the live browser session against the Figma web file as the next extraction layer.
- Read the file tree, page list, layer names, and selected-node metadata from the browser session before guessing anything.
- Use browser screenshots for screen-level visual capture when native export is blocked.
- Treat the browser session as a live read-only source of truth, not as a place to invent missing structure.
- Package all browser-captured outputs under `H:\Nebula\GPT\figma-export\<timestamp>\`.

## Why This Works
- Figma MCP gives structured design context and screenshots directly from the file.
- Dev Mode and Code Connect make Figma more developer-friendly and reduce interpretation drift.
- Local screenshot comparison catches the small details that text-only inspection misses.

## Per-Screen Workflow
1. Identify the exact Figma node or screen.
2. Extract:
   - design context
   - metadata if needed
   - screenshot
   - variable definitions if useful
   - assets
3. Build a screen spec from the extracted data.
4. Implement the screen in code using the approved baseline patterns.
5. Render locally.
6. Compare against the Figma screenshot.
7. Fix differences.
8. Repeat until the screen matches the target closely.

## Required Extraction Fields
- Screen name
- Node ID
- Screen order
- Layout structure
- Typography
- Colors
- Spacing
- Asset list
- Interaction states
- Responsive behavior
- Notes about non-obvious details

## Rules for Ambiguity
- If the export shows a screen number, that number controls ordering.
- If a component exists in the approved baseline, reuse it.
- If a detail is not visible in the export or the current reference, stop and re-check Figma rather than inventing behavior.
- If a section is already approved in Home, do not modify it unless the current task explicitly targets it.

## Verification Gates
- The rendered page must match section order.
- The rendered page must not introduce horizontal scroll.
- The rendered page must not change approved baseline sections.
- The rendered page must not replace coded UI with images.
- The rendered page must remain clean in console.

## Escalation Rule
- If a screen still diverges after a local implementation pass and one verification pass, gather the exact unresolved differences and re-check the Figma node rather than widening the scope.
- If the missing detail cannot be extracted from Figma context, use an external visual review only for the specific discrepancy.

## Context Compression Rule
- Before compressing context, re-read:
  - `AGENTS.md`
  - `VERSTKA_STANDARD.md`
  - `NEURO_VERSTKA_PREP.md`
  - `FIGMA_AUTONOMY_PROTOCOL.md`
- Never compact from memory alone.
