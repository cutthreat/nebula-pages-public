# Palm Reading — Caster / Anton classification

## Caster — complete visual census

**Verdict:** `pass_static_candidate_frozen`.

- **Page type / domain:** public conversion landing for Palm Reading in the Nebula public shell.
- **Primary task / main CTA:** understand the palm-reading offer, then choose **Get Your Palmistry Guide**.
- **Domain law applied:** exact C76 full-page composition, per-breakpoint re-authoring, copy and local asset provenance override generic landing-page conventions.
- **Business outcome / baseline:** introduce the offer and reach a static signup destination; measurement unavailable, so no conversion-effect claim.
- **Priority segment / journey:** a visitor exploring a palm-reading explanation before committing to signup; first-visit educational/conversion stage.
- **Positioning / benefit / RTB:** reflective palm-reading guidance; the C76 hand visual, three concrete benefit points, explanatory prose, question panel and SEO content are the page's source-proven rationale. No external claim is added.
- **Section-role map:** hero attracts/explains; scanner story reassures; question card develops relevance; SEO cards answer/expand; footer supplies route inventory.

Source authority is current C76 manifest `F9188F6EB1BC9E807F92AA1E84B891CE2CFE7DBC0925363E64381720679D4897`, not the older candidate receipt. Fresh split inputs retain the node-bound C76 raster SHA for every requested width.

| Width | Hero + header | Scanner story | Questions carrier/card | SEO default state | Footer | Caster result |
|---:|---|---|---|---|---|---|
| 1200 | 855px, source composition | present and ordered | present and ordered | first card open | source carrier/order | pass |
| 992 | 700px, source composition | present and ordered | present and ordered | first card open | source carrier/order | pass |
| 768 | 580px, source composition | mobile breakpoint order | mobile breakpoint order | first card open | mobile shell | pass |
| 576 | 740px, source composition | mobile breakpoint order | mobile breakpoint order | first card open | mobile shell | pass |
| 320 | 870px, independently authored source composition | source mobile title/order | source mobile title/order | four source cards, first open | mobile shell | pass |

Evidence: exact whole-page heights `4392/4297/4345/4272/5886`; fresh local hero source/live split for all five widths; fresh live clips for hero, story, questions, SEO and footer for every width. The hero split metrics are diagnostic only: browser font rasterization and source/export surface antialiasing are not used as a substitute for visual judgment. No human-visible hierarchy, wrap, asset, section-order or rhythm residual was found in the fresh review.

- **Typography / visual foundations:** source-derived Manrope scale, left-aligned desktop reading path, independently centered 320 hero, lavender-to-white surface rhythm and card hierarchy all hold. Visual-foundations verdict: pass.
- **UX / accessibility:** source-visible native controls retain focus and keyboard behavior; mobile composition is re-authored rather than squeezed. Accessibility verdict: keyboard/reduced-motion evidence pass; screen-reader/participant research is not claimed.
- **Marketing / attention:** the hand supports, rather than replaces, the palmistry promise; CTA follows benefit points. Marketing verdict: pass for source fidelity, `expert_proxy_only` for actual user comprehension/conversion.
- **User impact:** the visitor can scan a single offer, receive a clearly bounded CTA, and access the source content without visual or responsive disruption.
- **Bad-decision codes:** none observed; specifically no `decorative_dominance`, `template_before_truth`, `aria_without_behavior`, or `visual_only_collapse`.
- **Remove / reduce / raise / keep:** remove nothing; reduce no source content; raise no additional accent; keep the current isolated owner binding and source mobile re-authoring.
- **Copy-as-UI / visual-first replacement:** pass; labels and content match source and no explanatory implementation copy was introduced.
- **Implementation risk / code quality:** low in this isolated scope. Candidate CSS is a four-import binding, not an override tail; no page CSS growth occurred. Shared/legacy owners remain read-only.
- **Figma evidence / live computed evidence:** root contexts `910:20010` and `910:20635`; five exact raster hashes; live dimensions equal C76 whole-page dimensions; zero runtime structural defects.
- **Component / sibling scope / owning subtree:** only `.palm-page` and its hero, story, questions, SEO and footer owners; no shared/Home/Aura or other page consumer changed.
- **Breakpoint / adaptive verdict:** pass at 1200/992/768/576/320. Extreme-width policy is source frame-specific, with the 320 variant treated as its own composition.
- **Acceptance criteria / visual proof required:** met by current C76 identity, fresh five-width clips/splits, clean runtime and all source-visible control states. 
- **Instructions for oracle-verstalschik / next UI step / handoff:** freeze bytes; do not add a visual repair. If a later host scope is authorized, mount and test separately without modifying this static candidate.

## Anton — interaction and action-honesty review

**Result:** `pass_static_scope`.

### Facts

- Every width returns HTTP 200; horizontal overflow, broken images, duplicate IDs, console errors, page errors and failed requests are zero.
- CTA is a focusable anchor to existing local `_unzipped/signup-step-1.html` (HTTP 200); no checkout, payment, advisor availability or host runtime is claimed.
- Every visible SEO button is a native `BUTTON`; all source-visible cards open with keyboard Enter and default first-open state restores (`3/3` at 1200/992/768/576 and `4/4` at 320).
- Mobile drawer opens and closes by keyboard with `aria-expanded=true/false` at 768, 576 and 320.
- Twenty unique visible static destinations resolve HTTP 200 at each width. The runner uses `prefers-reduced-motion: reduce` and reports it active.

### Defects

None in the isolated static scope.

### Scorecard

| Area | Result |
|---|---|
| Clarity / CTA intent | pass |
| Navigation / links | pass |
| Keyboard / focus | pass |
| Responsive accessibility | pass |
| Action honesty | pass_static_scope |
| Canonical host / conversion backend | out of scope |

### Release decision

`pass_static_candidate_frozen`. This is not a Yii2, canonical-host, donor, heritage, promotion or deployment decision.
