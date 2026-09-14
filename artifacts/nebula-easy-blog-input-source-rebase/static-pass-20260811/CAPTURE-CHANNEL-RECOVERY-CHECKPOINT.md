# Blog Input — capture-channel recovery checkpoint

- `current_manifest_hash`: `E5A9922E6F77EEB1AB2CA58215F25EE94C54E3C71B3D73C4C95A5A3A956D2BC8`.
- `old_vs_current_reason`: `SOURCE-RECEIPT.md` names the 2026-07-16 immutable screenshot-export generation (`956C…/E6E0…/62EC…/6A9E…/A42F…`). The current authority is the 2026-07-27 normalized-export manifest and its current five local bytes (`C527…/726B…/0C9A…/7ED2…/3510…`). Paths and hashes differ, so the earlier receipt is advisory only; no cross-generation pixel equivalence is claimed.
- `subtree_map_path`: `artifacts/nebula-easy-blog-input-source-rebase/SOURCE-SUBTREE-MAP-20260811.md`, SHA-256 `9C0C09B4DCD715E875FDFE25663F12279044770F53446B997E37EFB60EEA31A2`.
- `lens_provenance_expected`: `20/20`.

## Fresh-context capture result

The prior shared Chrome target was discarded for proof. The new runner creates one fresh Playwright browser context and page for each exact CSS viewport, opens the local preview, waits for DOM/fonts/images, scrolls the source-mapped `.article-copy__secondary` owner into view, writes exactly one owner element clip, then closes the page and context before the next width. It never requests a full-page shot or uses the in-app compositor.

- Provenance output: `fresh-context-captures/FRESH-CONTEXT-LENS-PROVENANCE.json`, SHA-256 `65CC7EEE1CAA8BE478492481D4060CF543B01DAB5DC6D81F40DCB5C2F7BD6A88`.
- Result: `expectedLenses=20`, `actualLenses=20`, `missingLenses=0`.
- Every side/overlay/difference/edges image includes width, nodeId, current source SHA, manifest SHA, live product SHA, owner selector, capture method; source/live/derived file hashes are retained in that JSON.
- Source/live 1200 and 320 side readbacks are `fresh-context-captures/side-1200.png` and `fresh-context-captures/side-320.png`.

## Runtime/interactions

`fresh-context-captures/INTERACTION-RUNTIME.json`, SHA-256 `61C2865D8A81BD59A7B392FEDF7A43D2AA53507D2ABEFFFF4D7D6008FB483299` records HTTP 200 at all five widths, zero console/page/request errors, zero horizontal overflow and missing images, no `href="#"`, source-bound external TOC links, valid local CTA routes, keyboard CTA arrival at `signup-step-1.html` with a form, visible theme control where source shows it, and menu Enter/open/Escape/focus-return at 992/768/576/320.

## First source-fidelity residual, not repaired in this recovery

The fresh source/live owner receipt exposes a real but narrow geometry residual outside the capture channel:

| width | live owner | source owner | residual |
|---|---|---|---|
| 1200 | `1110×1590 @ y3584` | `1110×1530 @ y3607` | `y -23px`, `height +60px` |
| 992 | `930×1680 @ y3684` | `930×1680 @ y3737` | `y -53px` |
| 768 | `690×1472 @ y3268` | `690×1472 @ y3278` | `y -10px` |
| 576 | `510×1649 @ y3238` | `510×1649 @ y3245` | `y -7px` |
| 320 | `290×2055 @ y4153` | `290×2055 @ y4153` | exact |

No product CSS was changed for the capture recovery. This is the next exact source-bound repair decision; it is not a screenshot/harness blocker.
