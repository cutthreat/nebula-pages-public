# Blog Input inherited owner matrix

## Before structural rebind

| Source file | Selector / specificity | Breakpoints | Effective ownership |
|---|---|---|---|
| `_unzipped/blog-input-new.css:34` | `.blog-input-page .article-copy` / `0,2,0` | all | body color and inheritance root |
| `_unzipped/blog-input-new.css:35-40` | `.article-copy__breadcrumbs`, `__meta`, `__meta-item`, `__lead` / `0,2,0` to `0,3,0` | all plus 768/576/320 variants | metadata frame height and the lead start position |
| `_unzipped/blog-input-new.css:41` | `.blog-input-page .article-copy p` / `0,2,1` | all, `<=991`, `<=767`, `<=575`, `576-767` | paragraph margin, font size, line-height and stale `letter-spacing:0` |
| `_unzipped/blog-input-new.css:42-43` | `.article-copy h2`, `h2.article-copy__headline-lg` / `0,2,1` and `0,3,1` | all, `<=991`, `<=767`, `<=575` | heading scale, margin and stale `letter-spacing:0` |
| `_unzipped/blog-input-new.css:44,202-203,231` | `__tablet-break`, `__secondary > h2/p` | 768 and 320 families | source break visibility and post child rhythm |
| `_unzipped/blog-input-new.css:45,121,149,194,222,236` plus prior isolated CSS | `.article-banner-shell` / `0,2,0` | all five families | competing shell padding/margins and collapsed-flow offsets |

Observed pre-rebind computed geometry was `+17/-13/-10/-7/0px` in post-owner Y at `1200/992/768/576/320`; the 1200 last pre-banner paragraph was one line too tall because the inherited zero tracking widened its final text frame.

## Structural replacement

- HTML owner renamed from `.article-copy*` to `.blog-input-article*`; therefore every generic legacy selector above is non-matching for the body subtree.
- `.blog-input-article__pre` and `__post` use explicit source gaps (`40/40/20/20/30px`) and zero child margins.
- `.blog-input-article__meta-frame` binds the C76 `72/72/72/72/97px` metadata frame.
- Typography is explicit: desktop body `16/30/-0.16px`, desktop titles `40/60/-0.4px`, post title `50/60/-0.5px`; current source-proven responsive metrics are owned in the component, with 320 unchanged.
- `.blog-input-article__banner-shell` owns the exact source transition: `318px` at 1200/992, `300px` at 768/576/320, with explicit `40px` or `30px` external rhythm.
- The source-defined break before “As you probably know…” is visible at all five widths.

Matched owner-rule count is flat or lower after replacement: `15→14`, `15→15`, `24→20`, `28→26`, `33→30`. No transforms, negative offsets, per-width positional patches, or new `!important` declarations were introduced.
