# NEBULA Verstka Standard

## Goal
- Produce code that is visually and structurally one-to-one with the approved Neuro reference.
- Treat the existing Home implementation as the project baseline.
- Treat Figma export order as authoritative when screen numbers are present.

## Reference Hierarchy
1. Exact Figma export for the target screen / node
2. Approved reference Home and release `1.0`
3. Existing project code in `_unzipped`
4. Local implementation changes

## What "One-to-One" Means
- Same section order
- Same spacing rhythm
- Same typography scale and line-height logic
- Same responsive breakpoint behavior
- Same component style and naming conventions
- Same interaction style for hover, focus, active, accordion, slider, and similar patterns

## Source Bundle
- `https://pavlo-bondarchuk.github.io/neuro/home.html`
- `https://github.com/pavlo-bondarchuk/neuro`
- `https://github.com/pavlo-bondarchuk/neuro/releases/tag/1.0`
- `H:\Nebula\GPT\_unzipped`
- `H:\Nebula\GPT\Export НЕБУЛА 1200+`

## Coding Rules
- Use semantic HTML
- Reuse existing Bootstrap 4.6 layout primitives
- Keep CSS in separate files
- Keep JS in separate files
- Avoid global style overrides unless the reference already relies on them
- Prefer existing BEM-style naming and component structure
- Do not introduce image-based substitutes when the block can be built correctly in HTML/CSS

## Decision Rules
- If the same pattern already exists in the approved Home, reuse that pattern
- If the Figma export names a screen number, that order wins
- If Figma and current reference appear to conflict, preserve the approved baseline and implement the new block without breaking the baseline pattern
- Never invent new section order based on content semantics alone

## Workflow for Every Task
1. Read `AGENTS.md`
2. Read this standard
3. Read `NEURO_VERSTKA_PREP.md`
4. Read `FIGMA_AUTONOMY_PROTOCOL.md`
5. Read `FIGMA_PATTERN_LIBRARY.md`
6. Read the latest entries in `FIGMA_LESSONS.jsonl`
7. Inspect the current reference file(s)
8. Inspect the exact export screen(s)
9. Implement in code
10. Verify responsive behavior and visual consistency

## Quality Gates
- No horizontal scroll
- No accidental layout shifts
- No regression in already approved blocks
- No new console errors from the change
- No mismatch with export order

## Context Compression Rule
- Before compacting context, reread this document
- Also reread `FIGMA_AUTONOMY_PROTOCOL.md`
- Also reread `FIGMA_PATTERN_LIBRARY.md`
- Also reread `FIGMA_LESSONS.jsonl`
- Include:
  - goal
  - completed work
  - changed files
  - risks
  - open questions
  - next actions
- Never compress purely from memory
