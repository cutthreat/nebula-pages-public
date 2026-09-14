# Blog Input — independent visual and product classification

## Scope and evidence

- Candidate: `nebula-easy-blog-input.html`, isolated preview only.
- C76 source frames: `643:7448` (1200), `1006:23266` (992), `1006:25391` (768), `1008:22880` (576), `1008:23368` (320), file `C76M54fY7z926wIQoWFh8Y`.
- Fresh live proof: `five-width-postimage-and-interaction-proof.json`; all five viewports are HTTP 200, no horizontal overflow, broken assets, or console errors. Source-defined menu opens and closes; both source CTAs retain `signup-step-1.html`.
- Comparison: `source-live-five-width-overview.png` and `source-live-pixel-comparison.json`.
- Evidence ceiling: expert visual comparison plus browser runtime proof. This is not participant usability or conversion evidence.

## Caster gate

**Page type / primary task / CTA:** editorial article / read the guide and continue to the consultation route / `START MY FREE CONSULTATION`.

**Cold read (intent-contaminated):** the hero, title, table of contents, article and related cards are immediately recognizable and the CTA is legible. The secondary article block after the purple banner stops matching the source’s composed editorial rhythm: source centers the large lead heading in a dedicated wide field, while the candidate begins the same material in the left article column.

**Visible observations:**

1. At 1200 the C76 post-banner title `Is It Difficult to Learn Tarot Cards and Meaning?` is centered and has a separate quiet mass. In the live candidate it is left-aligned with the body column and the inter-section pacing is different.
2. The same source/live split is propagated through the five exact breakpoint screenshots. Identical document heights do not remove this mismatch; they only prove that a compensating rhythm difference exists elsewhere.
3. Header, hero, article body, related cards and footer survive at all five widths without clipping or failed media.

**Inference (not participant research):** the mismatch breaks the source’s editorial shift from CTA to long-form guidance and changes the hierarchy from a deliberate chapter opening to continuation copy.

**Subtraction test:** removing color/CTA still leaves the mismatch: it is caused by text-block axis and section rhythm, not the banner artwork or button color.

**Figma hierarchy / owning subtree:** the exact top-level frames are proven by the C76 manifest, but no hierarchy map or direct child/text-node receipt for the post-banner article section is available in this unit. The live family is `.article-copy__secondary` and its heading. That is insufficient to determine whether the source rule is an owning wrapper, a text-frame constraint, or breakpoint-specific content composition.

**Caster verdict:** `block` — `source_fidelity_mapping_incomplete`.

**Why this is blocked instead of tuned:** a CSS alignment change would be a visual guess and could shift the source’s 992/768/576/320 chapter composition. The exact Figma subtree and text-box constraints must be read before a scoped repair. No global CSS, screenshot substitution, or copied styling is authorized.

**Acceptance condition for a future repair:** attach the owning C76 child-node path and text/frame geometry for the post-banner section at all five widths; map it to `.article-copy__secondary`; then make one selector-scoped repair and retest the same five screenshots plus menu/CTA/overflow.

## Anton gate

**Result:** `not_pass_static_source_fidelity`.

**Facts:** route is live locally, controls are truthful to source markup, and no runtime/asset/overflow defect was observed. The requested source composition is not reproduced in a material editorial section.

**Defect / severity:** `P1` visual-source fidelity. A serious client comparing the page with the approved design will see a changed hierarchy and spacing contract, despite technically healthy runtime.

**Scorecard (expert proxy):** clarity 8/10; trust 7/10; navigation 8/10; form integrity N/A; visual hierarchy 5/10; copy quality 8/10; operator readiness 5/10.

**Fixes applied:** none in this classification pass. This avoids an unproven visual rewrite.

**Residual risk:** the isolated candidate must not be called accepted, donor, heritage, Yii2-ready, or promotable.

**Release decision:** `blocked` pending exact source subtree receipt and a source-scoped repair/retest.

