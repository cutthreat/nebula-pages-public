# Blog Input — current C76 post-banner source-to-live map

## Generation reconciliation

- Current authority is `figma-manifest/c76-normalized-export-20260727/blog-input.json`, SHA-256 `e5a9922e6f77eeb1ab2ca58215f25ee94c54e3c71b3d73c4c95a5a3a956d2bc8`.
- Its five current cached exports hash exactly to: `c527…0241c`, `726b…d8cc`, `0c9a…c0a3`, `7ed2…14c8`, `3510…85f4` at `1200/992/768/576/320`.
- `SOURCE-RECEIPT.md` copied an older 2026-07-16 truth-packet generation (`figma-manifest/truth-packets/blog-input-c76-source-refresh-20260716/source-refresh-manifest.json`) that names different immutable export paths and hashes (`956c…`, `e6e0…`, `62ec…`, `6a9e…`, `a42f…`). It is therefore advisory only. No cross-generation pixel claim is made; the current manifest and current export bytes govern this pass.

## Exact Figma owner chain and geometry

| Width | Frame / source path | Post-banner owner and heading | Geometry / composition | Live owner |
|---|---|---|---|---|
| 1200 | `643:7448 > 1006:23034 Frame 337 > 1006:23183 ALL PAGE > 1006:23035 CONTENT > 1006:23036 TXT` | `1006:23053` | content `1110×1530`; heading `x0 y0 1110×120`, Manrope Bold 50/60, `text-center`; banner ends before content at `y2310`, content begins `y2350` (40px rhythm) | `.article-copy__secondary > .article-copy__headline-lg` |
| 992 | `1006:23266 > 1006:23320 Frame 337 > 1006:23321 ALL PAGE > 1006:23358 CONTENT > 1006:23359 TXT` | `1006:23360` | content `930×1680`; heading `930×120`, Manrope Bold 50/60, `text-center`; banner `y2142–2460`, content begins `y2500` (40px rhythm) | same selector |
| 768 | `1006:25391 > 1006:25424 Frame 337 > 1006:25425 ALL PAGE > 1006:25462 CONTENT > 1006:25463 TXT` | `1006:25464` | content `690×1472`; heading `690×110`, Manrope Bold 40/55, `text-center`; banner `y1960–2260`, content begins `y2290` (30px rhythm) | same selector |
| 576 | `1008:22880 > 1008:22915 Frame 337 > 1008:22916 ALL PAGE > 1008:22953 CONTENT > 1008:22954 TXT` | `1008:22955` | content `510×1649`; heading `510×80`, Manrope Bold 30/40, `text-center`; banner `y2037–2337`, content begins `y2367` (30px rhythm) | same selector |
| 320 | `1008:23368 > 1008:23400 Frame 337 > 1008:23401 ALL PAGE > 1008:23438 CONTENT > 1008:23439 TXT` | `1008:23440` | content `290×2055`; heading `290×120`, Manrope Bold 30/40, `text-center`; banner `y2842–3142`, content begins `y3172` (30px rhythm) | same selector |

## Implementation binding

- `.article-copy__secondary` remains the current isolated body subtree.
- `.article-copy__headline-lg` uses the inherited breakpoint type scale already matched by source (`50/60`, `50/60`, `40/55`, `30/40`, `30/40`); the page-owned CSS supplies only the proven full-frame center alignment.
- `.article-banner-shell` retains the source-owned `60/60/30/30/30px` transition rhythm from the existing page-local cascade. No shared or legacy selector was changed.
