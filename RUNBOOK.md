# Nebula Runbook

## Before Any Task
1. Read `AGENTS.md`
2. Read `VERSTKA_STANDARD.md`
3. Read `NEURO_VERSTKA_PREP.md`
4. Read `FIGMA_AUTONOMY_PROTOCOL.md`
5. Read `FIGMA_PATTERN_LIBRARY.md`
6. Read `FIGMA_LESSONS.jsonl`
7. Inspect the current reference files in `_unzipped`
8. Inspect the exported Figma screens in `Export НЕБУЛА 1200+`

## Bootstrap
- Run `H:\Nebula\GPT\setup_env.ps1`
- This installs and verifies:
  - `python-docx`
  - `lxml`
  - `playwright`
  - `pillow`
- It also checks that Chrome/Edge is available

## Local Preview
1. If needed, refresh the environment:
   ```powershell
   powershell -ExecutionPolicy Bypass -File H:\Nebula\GPT\setup_env.ps1 -SkipBrowserCheck
   ```
2. Start a static server:
   ```powershell
   Start-Process python -ArgumentList '-m http.server 8123' -WorkingDirectory 'H:\Nebula\GPT\_unzipped' -WindowStyle Hidden
   ```
3. Open:
   - `http://127.0.0.1:8123/home.html`

## Visual Check
- Compare the rendered page with:
  - `H:\Nebula\GPT\Export НЕБУЛА 1200+\НЕБУЛА 1200+.png`
  - section exports like `02-What is Neuro_.png`
  - section exports like `07-VIDEO.png`
- Check:
  - block order
  - typography
  - spacing
  - card sizes
  - quote block and image treatment
  - responsive behavior

## Implementation Rules
- Do not introduce new libraries unless explicitly required
- Do not replace coded blocks with images when the block can be built in HTML/CSS
- Keep Bootstrap 4.6 and existing jQuery behavior
- Reuse the approved Home patterns first
- Use Figma export numbering as the order source

## Context Compression
- Before compacting context, reread:
  - `AGENTS.md`
  - `VERSTKA_STANDARD.md`
  - `NEURO_VERSTKA_PREP.md`
  - `FIGMA_PATTERN_LIBRARY.md`
  - `FIGMA_LESSONS.jsonl`
- Include:
  - current goal
  - finished work
  - changed files
  - risks
  - open questions
  - next actions

## Offline Figma Fallback
- If Figma MCP quota blocks extraction, generate the local manifest instead:
  - `powershell -ExecutionPolicy Bypass -File H:\Nebula\GPT\tools\generate_figma_manifest.ps1`
- Read the results from:
  - `H:\Nebula\GPT\figma-manifest\figma-manifest.local.json`
  - `H:\Nebula\GPT\figma-manifest\figma-links.local.csv`
- Use the fallback manifest together with `_unzipped` and the export bundle to implement and verify screens without guessing.

## Live Browser Export Mode
- When the live browser session can open the Figma file, use it before falling back to offline-only extraction.
- Capture:
  - file metadata
  - page tree
  - visible layer names
  - selected frame / node state
  - screenshots for review
- Store package outputs in:
  - `H:\Nebula\GPT\figma-export\<timestamp>\`
- Package the outputs with:
  - `powershell -ExecutionPolicy Bypass -File H:\Nebula\GPT\tools\build_figma_export_package.ps1 -WorkspaceRoot H:\Nebula\GPT`
- If native export is blocked by permissions, keep the blocker in the package and continue with manifest + screenshots.

## Screen Spec Generation
- Convert the manifest into screen-level specs:
  - `powershell -ExecutionPolicy Bypass -File H:\Nebula\GPT\tools\generate_screen_specs.ps1`
- Read the results from:
  - `H:\Nebula\GPT\figma-manifest\screen-specs\`
- Use the screen-spec files as the direct input for implementation tasks.

## Autonomous Free Learning Loop
1. Run the local polygon:
   ```powershell
   powershell -ExecutionPolicy Bypass -File H:\Nebula\GPT\tools\run_autonomous_free_learning.ps1 -WorkspaceRoot H:\Nebula\GPT
   ```
2. Read the latest report:
   - `H:\Nebula\GPT\learning-reports\autonomous-free-learning-latest.json`
   - `H:\Nebula\GPT\learning-reports\autonomous-free-learning-latest.md`
3. Use the queue to decide whether to verify, harden, or implement a screen.
4. Record reusable rules in `FIGMA_LESSONS.jsonl`.
5. Promote reusable rules into `FIGMA_AUTONOMY_PROTOCOL.md`, `VERSTKA_STANDARD.md`, or `FIGMA_PATTERN_LIBRARY.md`.
6. If you want the loop to run on schedule, install the daily task:
   ```powershell
   powershell -ExecutionPolicy Bypass -File H:\Nebula\GPT\tools\install_autonomous_free_learning_task.ps1 -WorkspaceRoot H:\Nebula\GPT
   ```
7. If the Telegram bot needs a fresh payload, regenerate it:
   ```powershell
   powershell -ExecutionPolicy Bypass -File H:\Nebula\GPT\tools\export_free_learning_telegram_payload.ps1 -WorkspaceRoot H:\Nebula\GPT
   ```
8. If you are wiring Telegram, use the bridge document:
   - `H:\Nebula\GPT\TELEGRAM_BRIDGE.md`
