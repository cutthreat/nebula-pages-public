# Free Learning Polygon

## Goal
- Train the Nebula Figma/верстка workflow locally without any dependency on Codex.
- Use Telegram as the human control plane and local scripts as the execution plane.
- Learn from Figma exports, the approved reference Home, and validated implementation diffs.

## Operating Model
1. Figma export and local fallback manifest become the observation layer.
2. Screen specs become the hypothesis layer.
3. Implementation queue becomes the experiment queue.
4. Local render + screenshot comparison becomes the evidence gate.
5. Lessons and pattern library become the memory layer.
6. Only validated findings are promoted into standards or runbooks.

## Allowed Resource Order
- Local data first:
  - `_unzipped`
  - `Export РќР•Р‘РЈР›Рђ 1200+`
  - `figma-manifest`
  - `FIGMA_LESSONS.jsonl`
- Local computation second:
  - PowerShell scripts
  - browser render checks
  - manifest/spec generation
- External paid browser lanes only for bounded verification or critique, never as the primary source of truth.

## Core Rule
- Never inspect implementation code before the screen spec and reference export are fixed.
- Never promote a pattern without evidence from local render or an explicit export rule.
- Never stop the loop because Codex tokens are unavailable.

## Autonomy Loop
1. Refresh manifest.
2. Regenerate screen specs.
3. Rebuild implementation queue.
4. Rebuild code plan.
5. Render and verify local pages.
6. Record lessons.
7. Update pattern library and runbook if the rule is reusable.
8. Publish a summary to Telegram.

## Evidence Standard
- Pass/fail must be based on:
  - matching export order,
  - matching layout geometry,
  - no horizontal scroll,
  - no console errors,
  - preserved baseline sections.

## Telegram Contract
- Telegram is the only operator UI.
- The bot should report:
  - current queue status,
  - pending experiments,
  - promoted rules,
  - blockers,
  - next actions.

## Promotion Targets
- `AGENTS.md`
- `RUNBOOK.md`
- `FIGMA_AUTONOMY_PROTOCOL.md`
- `FIGMA_PATTERN_LIBRARY.md`
- `VERSTKA_STANDARD.md`

## Success Criteria
- The loop can run entirely on local files.
- The reference Home remains intact.
- Screens can be tested and re-tested without Codex.
- Lessons accumulate into reusable rules.
