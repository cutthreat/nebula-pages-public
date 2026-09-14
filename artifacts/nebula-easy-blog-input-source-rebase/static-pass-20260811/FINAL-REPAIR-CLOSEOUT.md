# Blog Input — final single-repair closeout

## Status

- `status`: `not_pass_visual_source_fidelity_after_authorized_repair`
- `Caster`: `not_pass_visual_source_parity`
- `Anton`: `pass_interaction_honesty_and_client_readiness`
- No second CSS repair is authorized or applied.

## Root cause and applied source-bound repair

The map proved that the 1200 live final `<p>` contained an empty `<br><br>` line where C76 text node `1006:23062` is a `90px` frame. The page-local CSS hides that empty source-inconsistent line only at `min-width:1200`; source height is now exact (`1530px`). The same page-local repair also expresses the mapped larger-width banner-shell source spacing without using transforms, negative margins, overlays, or shared selectors.

The remaining material owner cause is inherited source/live cascade mismatch, not the capture channel:

- `_unzipped/blog-input-new.css:41-43` retains legacy `letter-spacing:0` on the body/headline frames where current C76 metadata is `-0.16px/-0.4px` with explicit Figma text-frame wrapping.
- The inherited pre-banner flow establishes the banner shell’s external position. Its inner padding cannot change that external position while retaining the exact `318px/300px` source shell height; a further correction would require another CSS batch against the pre-banner owner, outside the authorized post-owner repair.
- Lenses show the resulting live body wrapping is visibly different at 1200 despite matched final height. This is material, therefore visual acceptance is not claimed.

## Changed selectors

Only `nebula-easy-blog-input.css` changed:

- `.article-banner-shell` in `>=1200`, `992–1199`, `768–991`, `576–767` source breakpoint scopes;
- `.article-copy__secondary > p:last-child br` in `>=1200`.

No shared, legacy, baseline, HTML, or JS file changed in this repair.

## Geometry after repair

| width | live post owner | C76 owner | residual |
|---|---|---|---|
| 1200 | `1110×1530 @ y3624` | `1110×1530 @ y3607` | `+17px`, plus visible text-wrap mismatch |
| 992 | `930×1680 @ y3724` | `930×1680 @ y3737` | `-13px` |
| 768 | `690×1472 @ y3268` | `690×1472 @ y3278` | `-10px` |
| 576 | `510×1649 @ y3238` | `510×1649 @ y3245` | `-7px` |
| 320 | `290×2055 @ y4153` | `290×2055 @ y4153` | exact |

## Verification

- Fresh per-width Playwright contexts: all five HTTP 200; horizontal overflow, missing images, console/page/request errors are zero.
- Fresh lens proof: `20/20`, `missing=0`; every derived lens retains nodeId, current C76 SHA, manifest SHA, live product SHA and input/derived file SHA.
- Runtime/interactions: source-bound external TOC links, no `href="#"`, both local routes HTTP 200, keyboard CTA reaches the signup form, desktop theme control works, and mobile menu opens with Enter, closes on Escape, and returns focus at 992/768/576/320.

## Hashes and proof

- HTML: `01955AC4919DBF8F60A2AE6DC8C79CC9164D049568C9C71D39A3B3DA1BF0A895`
- CSS: `942CE3A9CCEE0D5A66EFB23187BCD2AE52202044E3BD8D0C88FA339091FEBEFF`
- JS: `2CAC0C622558C7E28D2F72857A9167C1E6A7CC17436913A18A7EA02454F8E0AD`
- Lenses: `fresh-context-captures/FRESH-CONTEXT-LENS-PROVENANCE.json`, SHA-256 `93BC275E0922C7CF468C984AD4ED0C0F20A35629BF314652A1FC771E09C940D4`.
- Runtime: `fresh-context-captures/INTERACTION-RUNTIME.json`, SHA-256 `61C2865D8A81BD59A7B392FEDF7A43D2AA53507D2ABEFFFF4D7D6008FB483299`.

## Next action

Keep the candidate isolated and do not run Yii2/Caster acceptance/promotion. Any future recovery requires a new Head-authorized source rebind of the inherited pre-banner/text-frame cascade; it is not a one-pixel tuning task.
