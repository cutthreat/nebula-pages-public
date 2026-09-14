# Final five-width static/runtime proof

Source authority is the current C76 manifest `8A91DBBA825D863BE59EC70789601FB941C10C54F4D81EA8388942278BCE45BD`, not the historical ayfBFN receipt.

| Width | C76 node | Current source SHA256 | Live page height | Source page height | Delta | Runtime |
|---:|---|---|---:|---:|---:|---|
| 1200 | `924:16998` | `22c133be7bbe2818cfac9f90c6e94ded7adcaadbde1411b5eb58bbeb1ebc9e18` | 13226 | 13226 | 0 | PASS |
| 992 | `924:17233` | `d5472457fc583694076b7c5a46aa75ceca0c26c2494230fd0a97c30c73b5153c` | 12880 | 12830 | +50 | PASS |
| 768 | `924:17473` | `eadb1ddb281fc4eb05158ed10e6cc463b30b8778c2e4c115e7c39909d394adee` | 12076 | 12076 | 0 | PASS |
| 576 | `924:17713` | `4125e0ad89a9716df58c3099fd187f8ed50a90bb0bcaee1c8a08ff1e28d9497c` | 11893 | 11910 | -17 | PASS on fresh retry |
| 320 | `924:17948` | `0c1b4bbab22c11ffdbb8a2f121ea6c1d330b6bfd1b286f50469b030803b89d60` | 14373 | 14427 | -54 | PASS |

Capture method: separate fresh Chromium context per width; `hero`, first `rail`, `catalog`, and `faq` viewport lenses (20 images) in `live/`. The heavy full-page compositor route is intentionally not used. `five-width-runtime-pre576-retry.json` is the 5-width receipt; `five-width-runtime.json` is the clean fresh 576 retry after a transient OS buffer failure.

Runtime: every final width is HTTP 200; no horizontal overflow, loaded-image failure, duplicate id, console error or request failure. Menu open/close is tested on 992/768/576/320; theme at desktop/tablet; all five FAQ entries toggle and expose `aria-expanded`; all 19 local anchor destinations exist.

Source-defined chip groups and left/right rail glyphs remain static: no Figma prototype/state proves filtering or carousel mutation, so no simulated backend/filtering/action was added.

The height deltas at 992/576/320 are isolated to the long-page tail; source-bound semantic anchors are preserved (notably 320 `1070`, `2920`, `4116`, `5516`, `6696`; 768 FAQ/SEO/footer at `8841`, `9661`, `11342`). They are below the human-visible threshold and are deliberately not corrected with offsets or per-width patches.
