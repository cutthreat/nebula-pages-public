# Blog frozen-candidate root-cause diagnostic

Status: `not_pass_visual_source_fidelity`

Scope: frozen `nebula-easy-blog.html` candidate only. No layout/product repair was applied.

## Fresh source/live evidence

| Width | C76 node | Source/live dimensions | MAE RGB | High-delta pixels |
|---:|---|---|---:|---:|
| 1200 | `642:5788` | `1200x3142` / `1200x3142` | 23.7687 | 18.936% |
| 992 | `1001:20800` | `992x3292` / `992x3292` | 21.0597 | 16.484% |
| 768 | `1002:21942` | `768x3632` / `768x3632` | 25.3503 | 19.072% |
| 576 | `1002:23955` | `576x3318` / `576x3318` | 20.8509 | 16.535% |
| 320 | `1005:22168` | `320x6286` / `320x6286` | 28.3644 | 22.591% |

Fresh postimages are `static-pass-20260810/rebound-{1200,992,768,576,320}.png`.
The capture harness no longer injects a position override into `.site-header`; the earlier injection was harness-only and is not used as a product finding.

## Source -> DOM -> CSS mapping

| C76 source owner | Live DOM/component | Cascade owner | Confirmed discrepancy |
|---|---|---|---|
| `642:5789` `01-HEADER` | `.site-header`, `.site-header__inner`, `.site-header__nav`, `.navbar-nav` | `_unzipped/blog-new.css`, `.01.css`, `.02.css` | C76 desktop header has a 1110px row at y=39, six 18px nav items with 30px gaps and a theme/sign-up action cluster. There is no page rule for `.site-header__nav`/`.navbar-nav` gap. At narrow widths the C76 raster has burger + language + centred logo + toggle + sign-up; the DOM has no language control. This is structural, not a paint rebind. |
| `642:5882` `Bunner HEADING`, child `642:5889` | `.blog-promo`, `.blog-promo__btn` | `_unzipped/blog-new.02.css:650-659` | Figma specifies 1200px BG, 200px inner banner and a `CONNECT NOW` button: 60px high, 19px, 15px radius. Live DOM says `Start my free consultation`; CSS specifies 15px and 12px radius. Geometry is partly inherited, but copy/control contract is wrong. |
| `643:7311` `FIND ANSWERS`, child `643:7206` | `.blog-advisor`, `.blog-advisor__expert` | `_unzipped/blog-new.02.css:676,686-703` plus inherited `data-heritage-component="expert-card.v1"` DOM | Figma card is 350x479 within a 1200x560 panel. Live at 1200 computes a 350x597.156 card; it escapes the panel because `min-height:479px` does not constrain inherited card content. This repeats at all source widths. |
| `1001:20626` footer | `.site-footer.bg-light-gray` | legacy footer cascade | C76 has the rounded light-gray footer container; the frozen 1200/992 live postimages render a materially different white/footer rhythm. Exact owning Figma child mapping is required before a repair. |

## Root cause

`nebula-easy-blog.html` differs from `_unzipped/blog-new.html` only by the isolated `<base>` and stylesheet binding (3 insertions / 2 deletions). The candidate therefore reuses a stale legacy DOM/cascade rather than binding the current five C76 screen contracts. The defect is systemic because the same header, promo, advisor-card and footer owners drive every breakpoint.

## Classification and next action

- Classification: `real_visual_repair_required`; not `rebind-only`, not `blocked_by_source`.
- A minimal rebind cannot create the missing mobile header language/control structure, replace the stale CTA contract, and constrain/recompose inherited advisor cards.
- Required bounded next unit: isolate a source-first rebuild of the four owners above in `nebula-easy-blog.html/.css`, using the existing five C76 frames; do not mutate `_unzipped/blog-new.*`, Home, Aura, shared, host, or deploy.
- Yii2 packaging and Caster/Anton acceptance are not applicable until that unit has fresh source/live visual proof.

## Bounded repair closeout — 2026-08-10

Status: `not_pass_visual_source_fidelity`.

One isolated source-backed batch changed only `nebula-easy-blog.html` and `.css`: C76 header controls/nav, promo CTA copy/geometry, advisor-card height/composition, and rounded footer container. No Home, Aura, shared, host, deploy, or legacy source file changed.

| Width | Source/live dimensions | MAE RGB | High-delta pixels |
|---:|---|---:|---:|
| 1200 | `1200x3142` / `1200x3142` | 18.3586 | 12.091% |
| 992 | `992x3292` / `992x3292` | 16.5597 | 10.844% |
| 768 | `768x3632` / `768x3632` | 20.9482 | 13.840% |
| 576 | `576x3318` / `576x3318` | 19.8900 | 13.655% |
| 320 | `320x6286` / `320x6286` | 26.7435 | 17.889% |

Fresh runtime proof: `static-pass-20260810/rebound-five-width-runtime-proof.json` is PASS: HTTP 200, exact C76 heights, no horizontal overflow, no console/request failures, CTA route present, and menu open/close PASS on 768/576/320.

Residuals remain material, so no Caster/Anton or Yii2 package gate was started:

- `320`: C76 places the carousel/pagination state before the advisor card and the `Find advisor` CTA after it; the isolated DOM keeps CTA before the card and has no source carousel state.
- `1200` and descendants: article-grid/container ownership remains inherited from the legacy cascade (first-row cards begin at the viewport edge instead of the C76 container rhythm). This lies outside the four-owner repair boundary.

No further CSS pass is authorized by this unit. The candidate is not donor, not promotable, and not Yii2-ready.
