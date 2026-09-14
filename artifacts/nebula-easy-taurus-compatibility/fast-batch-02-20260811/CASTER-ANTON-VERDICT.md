# Taurus Compatibility — Batch 02 Caster / Anton verdict

## Scope and source

- C76 five-width source: `taurus-compatibility.json`, nodes `631:5673`, `992:25786`, `992:27315`, `998:21319`, `999:22307`.
- Fresh direct Chromium source/live split: `source-live-split-proof.json`.
- Direct full-page heights: `-1/-1/0/-1/0 px` at `1200/992/768/576/320`; this is non-blocking raster rounding.

## Caster — PASS `pass_visual_source_parity`

The full source/live splits preserve the page's hero, sign grid, two consultation banners, chart, video poster, long-form reading sequence, cards, FAQ and footer at all five widths. The repaired host-intent dialog is absent in the source baseline and appears only after explicit activation, so it does not alter source composition. The local-font rebind uses the same Manrope family and has a separate five-width invariance receipt.

Visual residual: no human-visible structural mismatch. The only measured delta is the non-blocking one-pixel full-page raster-height variance at 1200, 992 and 576.

## Anton — PASS `ready_static_candidate`

- Both consultation banners are keyboard-actionable and first disclose the real host boundary; the user can then continue to the existing local signup route.
- The video control no longer impersonates playback. It opens an explicit host-intent state that says the local C76 packet has artwork but no playable media.
- FAQ provides all five answers, a single-open `aria-expanded` lifecycle and keyboard operation at every width.
- Mobile menu opens, focuses and closes by Escape; no broken assets, duplicate IDs or horizontal overflow remain.

## Honest residuals

1. `host_video_media_unbound`: no exact local video asset or host player binding exists; the control is intentionally an explicit host intent, not playback.
2. `canonical_host_mount_pending`: static page/package only; no Yii2 host runtime, deploy, donor or promotion claim.

## Decision

`pass_static_candidate_frozen`; `donor=false`; `promotion=false`; `host_runtime=false`.
