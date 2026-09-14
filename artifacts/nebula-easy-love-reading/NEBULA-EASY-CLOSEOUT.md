# Nebula easy — Love Reading

Status: `isolated_experiment_ready_with_fresh_live_proof`

## Decision

Selected `Love Reading`: it is outside the protected Aura Reading/Home write-set, has a dedicated page owner, and the current C76 source refresh declares exact source rows for `1200 / 992 / 768 / 576 / 320` while keeping `acceptanceStatus: not_accepted`.

## Source

- C76 source packet: `F:\CodexProjects\confideline-nebula\implementation\nebula-gpt\figma-manifest\truth-packets\love-reading-c76-source-refresh-20260720\source-refresh-manifest.json`
- Source frames: `917:20802`, `917:21037`, `917:21277`, `917:21517`, `917:21752`
- Source references: `F:\CodexProjects\confideline-nebula\implementation\nebula-gpt\compare-board-sources\love-reading-c76-1200.png`, `...-992.png`, `...-768.png`, `...-576.png`, `...-320.png`

## Implementation

- `nebula-easy-love-reading.html` — isolated page route and complete Love Reading content.
- `nebula-easy-love-reading.css` — page-owned responsive system, local Manrope, source-backed assets, 4 responsive adaptation bands covering all five target widths.
- `nebula-easy-love-reading.js` — mobile navigation open/close behavior.

## C76 fidelity pass

- Header now follows the source split: desktop at `1200`, compact menu/header at `992 / 768 / 576 / 320`, with the source language-control behavior.
- Hero now follows the source geometry: split desktop/tablet composition, centered stacked mobile composition, source copy, and no extra hero CTA.
- Expert cards now use source stats, descriptions, `consultation done` labels, responsive names/avatar behavior, and the source 3/2-column grid contract.
- Help, reading-path, FAQ headings and copy were aligned to the source wording.

The production `aura-reading-new.html`, Aura guard files, Home, and shared CSS/JS were not changed.

## Process

Used a source-first, page-owned implementation: selected the C76 exact five-width packet, inspected the five source rasters and local assets, built an isolated HTML/CSS/JS route, then ran static checks followed by a fresh local HTTP preview in the штатный Codex In-app Browser. Responsive checks used the requested CSS widths; the browser reports a device scale of `0.8`, so the capture inputs and resulting CSS viewport widths are recorded in the proof JSON.

## Verification

- Stable preview plan: `ready`, localhost HTTP URL selected, widths `[1200, 992, 768, 576, 320]`, no missing dependencies.
- HTML parser: pass; no unclosed or mismatched tags.
- JavaScript syntax: pass (`node --check`).
- Local asset/link scan: pass; `broken=0`.
- Accessibility-oriented static scan: all images have `alt`, menu button has an accessible name, one FAQ is open by default, reduced-motion rule present.
- Fresh live runtime: all five CSS widths had zero broken images, loaded local Manrope, and no horizontal overflow.
- Interactions: mobile menu passed `false -> true -> false`; FAQ native `details` opened a second item; browser console errors `0`.
- Browser preview: `http://127.0.0.1:8765/nebula-easy-love-reading.html`.
- Screenshot proof: `proof/live-1200.png`, `proof/live-992.png`, `proof/live-768.png`, `proof/live-576.png`, `proof/live-320.png`.
- Machine-readable proof: `proof/static-verification.json`.

## Reconciliation marker

- Reconciled after the disconnect against the existing postimages and the last proof state.
- Repair applied: `.easy-wide-only` is hidden and `.easy-compact-only` is shown at every width below `1200px`.
- Current SHA-256: HTML `01FE6E46FA2813112F1F982460D4A481327FC80BAD63AF211E74A29525A6389B`; CSS `2C3D3D5B06BF00DBB763B8108EB7E287A586FAA3F99744B07C099A4B7809ED92`; JS `65D42441FDBAAC0118DD7A4D776BDC37F7C2B0FA0BCE9BFBA86009C93A5C11D3`.
- The five `live-*.png` postimages were recaptured after this repair at exact CSS widths and their hashes/dimensions are recorded in `proof/static-verification.json`.

## Compare panel pass

- The shared compare panel was opened on the canonical `Love Reading` source/live pair and stepped through `1200 / 992 / 768 / 576 / 320`.
- Panel result: `1200` and `576` full-page dimensions match exactly; `992` is `+3px`, `768` is `+1px` measured width and `+10px` height, and `320` is `+64px` height from canonical live wrapping.
- The panel catalog does not register the isolated `nebula-easy-love-reading.html` route, so the panel receipt is source/live contract evidence; the isolated route remains covered by the direct five-width live proof.
- Machine-readable rows and panel screenshot refs are under `compare_panel_pass` in `proof/static-verification.json`.

## Caster / Anton acceptance

- Caster: `pass_with_expert_proxy_ceiling`. The focal route, typography, mobile re-authoring, source content, and visual proof are coherent. One P3 remains: the card CTA uses a lightweight local glyph instead of the source inline chat-bubble SVG.
- Anton: `conditional`. The route is usable and honest as an isolated experiment; menu/FAQ are live, assets resolve, and console errors are zero. Production promotion remains explicitly out of scope, and the CTA glyph deviation is recorded rather than hidden.
- Acceptance evidence and scorecard are machine-readable under `caster_acceptance` and `anton_acceptance` in `proof/static-verification.json`.

## Deliberate boundaries

- This is an isolated experiment route; it does not promote or replace the production Love Reading route.
- The write-set for this experiment is limited to the three `nebula-easy-love-reading.*` files plus its artifact/proof folder. The worktree already contained older dirty paths for `home.html` and Aura files; those were preserved and not edited by this experiment.
- The local HTTP preview process is only a local proof transport and has no external network dependency.

## Honest verdict

For the stated “Nebula easy” experiment, the page is ready: it has a small page-specific write-set, complete content/assets, responsive behavior at all five requested widths, fresh visual captures, and verified interactions. This was faster and cleaner than editing the existing route. It is not production-promoted; the remaining step for production acceptance is a separate governed comparison against the canonical Love Reading route.
