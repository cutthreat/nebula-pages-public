# Privacy Policy — C76 visual / product classification

## Evidence boundary

- Exact C76 source frames: `869:8706` / `871:9004` / `871:9202` / `872:7387` / `872:7588` from `C76M54fY7z926wIQoWFh8Y`.
- Live candidate: `nebula-easy-privacy-policy.html`, fresh local route and postimages at `1200/992/768/576/320`.
- Runtime: HTTP 200, zero horizontal overflow, broken assets and console errors at all five widths; source-defined menu and Signup CTA state pass.
- Source hierarchy: Figma context for `869:8706` confirms canvas `869:8707`, main grid `869:8709`, aside/nav `869:8710`, article `869:8722`, and footer `871:8828`. A full-size fresh Figma raster was retrieved for `872:7588` because the older local carrier was truncated.
- Evidence ceiling: Caster/Anton expert comparison plus static browser proof; no user-research, host-runtime, authentication, or conversion claim.

## Caster

| Field | Verdict |
|---|---|
| Page type / primary task | Legal information page / read, navigate policy sections, optionally proceed to source Sign up route. |
| Main CTA / domain law | `Sign up` / legal content must be quiet, readable, complete and not obscured by promotion. |
| Cold pass | Intent-contaminated. I first read the active policy rail and the `IMPORTANT INFORMATION` article opening; the page immediately reads as a long-form policy, not a marketing screen. |
| Visual / typography / UX | **Pass.** One calm reading axis at desktop; rail becomes preceding navigation at compact widths; title hierarchy, dense body copy and footer survive without clipping. |
| Marketing | Not applicable as a conversion claim; the modest header CTA does not overtake the legal task. `measurement_unavailable`. |
| Source-to-live mapping | `869:8709 → .privacy-policy__grid`; `869:8710 → .privacy-policy__aside/.privacy-policy__nav`; `869:8722 → .privacy-policy__article`; `871:8828 → .site-footer`. |
| Live computed evidence | At 1200: grid `1110px` at `x=45,y=130`, aside `350px`, article `730px`; H1 `32px/38px/500`, policy H2 `40px/48px/600`, Manrope. At 320 the authored stacked structure is `288px`, H1 wraps at `25px/30px`, H2 at `34px/40px`; no horizontal overflow. |
| Breakpoint / adaptive verdict | **Pass 1200/992/768/576/320.** Desktop preserves the rail/article pair; 768 and below re-author it into navigation then article. Full-height difference is at most 3px against C76 (1px at 1200/992/320, -3px at 576) and is non-blocking rendering tolerance. |
| Component / sibling scope | All five rail links, article headings, long paragraphs, ordered lists and footer columns were included by full-page proof. |
| Critical layers | Source-backed CSS and local live HTML; no invented BG, media, rating, icon, gradient or screenshot substitute. |
| Copy-as-UI / visual-first | Pass. The legal prose is substantive disclosure, not instruction text compensating for a control. |
| User impact | The intended legal reading path remains complete and scannable at every source width. |
| Bad-decision codes | None observed. Pixel MAE is explicitly not treated as a visual defect because the geometry/visual readback matches and it includes anti-aliasing/font paint. |
| Proposed fix / remove-reduce-raise-keep | **No repair.** Keep source structure and local assets unchanged. |
| Implementation risk | Do not promote this standalone clone into a host layout or alter the long-policy wrapping without a host-level source/runtime pass. |
| Visual proof / next UI step | Proof is current. Next only if requested: Yii2 host mount under a separately owned view/layout/AssetBundle target. |
| Caster verdict | `pass` for isolated five-width source fidelity; `accepted_visual_static_candidate`. |

## Anton

- **Result:** `conditional` — acceptable isolated static public surface.
- **Facts:** legal purpose is obvious; page is readable and source-aligned; menu opens/closes; the visible Signup link retains its real source target. No fake local control was added.
- **Defects:** no P0/P1/P2 human-visible or interaction defect found in the bounded static scope.
- **Scorecard:** clarity 9/10, trust 8/10, navigation 8/10, form integrity N/A, visual hierarchy 8/10, copy quality 8/10, operator readiness 7/10.
- **Fixes applied:** none — a repair would be fidelity-tuning without a demonstrated defect.
- **Residual risks:** isolated preview is not Yii2 host runtime; external/legal route destinations and full signup flow were not claimed or exercised.
- **Release decision:** `ready` **only for** the isolated visual/static candidate. `donor=false`, `promotable=false`, no canonical host/deploy/product acceptance implied.

