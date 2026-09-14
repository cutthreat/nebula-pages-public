# Taurus Compatibility — reconciled visual candidate

- Status: `visual_candidate_reconciled`
- Human-visible blockers in the fresh source/live pass: `0`
- Donor / promotion / heritage: `false`
- Canonical host / Yii2 / deploy: not attempted
- Preview: `http://127.0.0.1:8765/nebula-easy-taurus-compatibility.html`

## Existing-page reconciliation

- The older page `taurus-compatibility-new.html` already existed and remains untouched.
- Its package `artifacts/taurus-compatibility-layout-quality-048` is recorded as `technical_layout_ready_not_accepted`.
- The repaired `nebula-easy` candidate is the stronger isolated implementation; no duplicate was promoted to canonical.

## Source truth

- Figma file: `C76M54fY7z926wIQoWFh8Y`
- Nodes: 1200 `631:5673`; 992 `992:25786`; 768 `992:27315`; 576 `998:21319`; 320 `999:22307`
- Manifest: `figma-manifest/truth-packets/taurus-compatibility-c76-source-refresh-20260720/source-refresh-manifest.json`
- Manifest SHA-256: `AFAE41964A9524B021E947EC2FC1EDF7A3373194901406E5D7AB8F91907AD3E9`

| Width | Source SHA-256 | Live SHA-256 | Height delta | Normalized MAE |
|---:|---|---|---:|---:|
| 1200 | `559BB2DE13802641CC7B65582D6AB4EC81C35B91709B934B529BF680115CF92B` | `4B53CF86D6576CDED2FAC8C3742F6C8FCBC30A1E3912FEE97BBFA3DD76DB6D64` | -1 | 0.058436 |
| 992 | `9D887FB483F91593CD8A736B84ACFE24F15EFEA5F92627FAF0FA51983E5CD3B4` | `F62B6C442018AF9ABA64A870573890CD29D50C5F162C485A0787E84BDA594383` | -1 | 0.082932 |
| 768 | `020B3B21840070153208D44DA5403F3B4EF1A4042EBF26EE9275DB029A73CE80` | `7A9AABBA07CD98D3CE922A05B6D5B008C24743EFE72759034A2AE30CEEE02FBE` | 0 | 0.080634 |
| 576 | `96B176635A381D20B7B2F73E343DCFF56A3FEEEA2387BF5AA5E9D2B9BB3F8264` | `8104583D0FCA1EEF052FD7002A03BCABA934AB49704B2F28A7D92FF37B286B14` | -1 | 0.086510 |
| 320 | `D9FB26E740C72A8C8CF2FC1A14209CD55C2E2927F4A1EE9BE770181D0CD4C696` | `1675A7A2941449CFC06FF2FD42A5B4261F3C18A4245D840B8A9B00820F4E7BFF` | 0 | 0.094624 |

## Repaired defects

- Restored exact source hero gradient and Taurus artwork.
- Rebuilt chart ratings as five-heart scales with the C76 values and source paragraph rhythm.
- Fixed the 1200 chart-to-Best overlap and all measured section-boundary overflow.
- Corrected 1200/320 heading wraps in Best and video.
- Replaced the generic video, sex, TaurusWoman and TaurusMan imagery with exact Figma-source assets.
- Restored mobile zodiac-card geometry, FAQ controls, footer stack and source typography rhythm.

## Runtime / interactions

Fresh proof: `runtime-proof.json` — `85DE3B56106BE3620871FB31A67C2716C35B03E51DF8AF2BB3EF9B8ECF1289B2`.

- 1200/992/768/576/320: HTTP 200; horizontal overflow 0; measured section overflow 0; 28/28 images complete; console/page/request errors 0.
- FAQ: close/reopen and answer visibility pass on every width.
- Video: activation state pass on every width.
- Drawer: open/expanded/close pass at 992/768/576/320.
- Sign-up route: `signup-step-1.html`.

## Independent blind readback

- Desktop observer: `human-qa/observer-1200.json` — pass, no visible frictions.
- Mobile observer: `human-qa/observer-320.json` — pass; only product-level observation was that the first screen invites scrolling rather than presenting a dominant CTA.
- Evidence ceiling: two first-viewport qualitative probes, not population research and not a fidelity acceptance authority.
- Spark benchmark: `selection_fit=good`; `correction_count=0`; `independent_verifier_passed=true`; `throughput_effect=desktop/mobile probes ran in parallel`; `would_reuse_same_setup=true`.

## Proof refs

- `visual-proof.json` — `85A6BB8DCA5DE118D6C62DA2F8977CD61E9912D8508B1A2FCBD9F77B8080FBBC`
- `screenshots/taurus-{1200,992,768,576,320}.png`
- `splits/taurus-{1200,992,768,576,320}-source-live.jpg`
- `recheck-20260810/final-1200-top.jpg`
- `recheck-20260810/final-320-{hero-zodiac,chart-best,video}.jpg`
- `human-qa/{viewport,retina,perception,observer}-{1200,320}.*`

## Changed files

- `nebula-easy-taurus-compatibility.html` — `C2D6971163AB014D71E052AB5786E33EF06FA523FA441061341D3AFB55CC209A`
- `nebula-easy-taurus-compatibility.css` — `EFF67B0D1B80BFD859722EF6FF72187A306D77D32306066CE2BD846BD02D290D`
- `nebula-easy-taurus-compatibility.js` — unchanged, `B041A541098FC63F33632577288408FA2B751592F03F3735006AF045FCF90F74`
- `run-five-width.mjs` — `38C37E509FCD771E1A30ACDA7C9EA791C2E263BE881F7A27DA46D2B18BD7CDDB`
- Exact Figma-source assets and task-local proof files under this artifact directory.

## Intentional residuals

1. The 1200 C76 raster repeats `ARIES` under unrelated zodiac illustrations. Live keeps semantically correct labels; this is an intentional literal-raster divergence.
2. Narrow-width MAE remains higher because of text rendering and the semantic-label correction, but the fresh split shows no material clipping, overlap, broken wrap, missing asset or interaction defect.
3. This remains an isolated visual candidate. Canonical Yii2 mounting, route binding and production promotion are outside this pass.

## Rollback

Remove only the isolated `nebula-easy-taurus-compatibility.*` files and `artifacts/nebula-easy-taurus-compatibility/**`. No Home, Aura, Love Reading, Psychic Reading, shared, host, Yii2 or deploy files were changed.
