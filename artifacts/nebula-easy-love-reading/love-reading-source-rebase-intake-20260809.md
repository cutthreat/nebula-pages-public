# Love Reading source-rebase intake

Status: `source_ready` for a fresh isolated rebase; the previous Nebula easy candidate is preserved as `rejected_visual_source_fidelity`.

## Exact C76 raster contract

| Width | Raster | Height |
| --- | --- | ---: |
| 1200 | `compare-board-sources/c76-normalized-export-20260727/love-reading-1200-917-20802.png` | 7607 |
| 992 | `compare-board-sources/c76-normalized-export-20260727/love-reading-992-917-21037.png` | 7283 |
| 768 | `compare-board-sources/c76-normalized-export-20260727/love-reading-768-917-21277.png` | 7580 |
| 576 | `compare-board-sources/c76-normalized-export-20260727/love-reading-576-917-21517.png` | 7657 |
| 320 | `compare-board-sources/c76-normalized-export-20260727/love-reading-320-917-21752.png` | 9037 |

## Source structure and assets

- Body/copy/state: `_unzipped/love-reading-new.html`.
- Geometry/responsive source: `_unzipped/love-reading.css`, `_unzipped/love-reading.01-core.css`, `_unzipped/love-reading.02-responsive.css`, `_unzipped/love-reading.owner.00.css`, `_unzipped/love-reading.owner.01.css`.
- Exact local page assets: `_unzipped/img/love-hero-art-figma.png`, `_unzipped/img/love-best-online-art-figma.png`, `_unzipped/img/love-reading-source/*`, `_unzipped/img/love-reading-best-online/*`, avatars, app/footer assets.
- Verified source sections: Home-compatible header; hero; six advisor cards; proof/reviews and four help cards; lavender reading-path surface; primary FAQ; five-item SEO accordion with visible closed teasers; footer.

## Rebase boundary

Write only `nebula-easy-love-reading.html`, `nebula-easy-love-reading.css`, `nebula-easy-love-reading.js`, and isolated page assets/proof. Do not reuse rejected body structure or stale cascade; do not touch Aura, Home, shared production files, or Yii2.
