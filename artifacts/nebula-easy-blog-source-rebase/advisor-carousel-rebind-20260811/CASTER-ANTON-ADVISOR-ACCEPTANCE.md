# Blog advisor carousel — Caster / Anton acceptance

Date: 2026-08-11

## Frozen boundary

- Challenge scope: `.blog-advisor` and its dependencies at 1200/992/768/576/320.
- The previously accepted `.blog-page` composition outside the advisor was checked for regression but was not reopened.
- Source authority: current C76 manifest `blog.json`, nodes `642:5788`, `1001:20800`, `1002:21942`, `1002:23955`, `1005:22168`.

## Caster

Verdict: `pass_visual_source_parity_within_frozen_scope`.

- 1200/992: two-card horizontal composition, source card geometry and carrier height retained.
- 768: 768×880 carrier, 335×483 cards, 20px gap, centered 200×60 CTA.
- 576: static two-card row, 510px rail, 250×437 cards, 10px gap, no invented controls, 183×50 CTA with source single-line label.
- 320: 320×960 carrier, 290px clip, 510px rail, 250×437 card and 30px visible-next state; exact C76 previous/next SVG controls.
- No human-visible advisor hierarchy, clipping or wrap blocker remains. Subpixel/anti-aliasing differences are nonblocking.
- Full-page screenshots show no regression outside the frozen boundary. Historical document-height deltas (+18/+22/+33/+132/+124px) remain attributable to frozen lower-page rhythm and are not introduced by this advisor rebind.

## Anton

Verdict: `pass_action_honesty_and_accessibility`.

- The 320 controls are native buttons with accessible names, bounded index and truthful disabled states.
- ArrowLeft/ArrowRight work on the focused rail; after a terminal move focus is transferred to the available control.
- Reduced motion uses immediate scrolling; normal mode uses smooth scrolling.
- At 576 and above no carousel controls are invented because C76 proves a static composition.
- Menu, theme, 20 local routes, CTA route, keyboard/focus, console and request checks pass.

## Decision

`pass_static_candidate_frozen`. This does not claim donor, heritage, Yii2, canonical host, promotion or deployment readiness.
