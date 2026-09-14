# Palm Reading — current C76 source map

**Authority:** `figma-manifest/c76-normalized-export-20260727/palm-reading.json` — SHA-256 `F9188F6EB1BC9E807F92AA1E84B891CE2CFE7DBC0925363E64381720679D4897`.

| Width | Root node | Exact raster | Source SHA-256 | Frame / whole-page height |
|---:|---|---|---|---|
| 1200 | `910:20010` | `compare-board-sources/c76-normalized-export-20260727/palm-reading-1200-910-20010.png` | `9C5ED6D9EA914A1FBBF8363859A82BB00CA389F37222957FF2374FB8E10C0EC6` | 1200×4392 |
| 992 | `910:20217` | `compare-board-sources/c76-normalized-export-20260727/palm-reading-992-910-20217.png` | `7345DAB94707039DA6A2A3D314CF0AC8E19650528B960EFBF9B56B6DC4011F59` | 992×4297 |
| 768 | `910:19799` | `compare-board-sources/c76-normalized-export-20260727/palm-reading-768-910-19799.png` | `F50C73949261191B832E9B4897A03F6F8EB7017F3E7728D485F29B87A4996CF3` | 768×4345 |
| 576 | `910:20428` | `compare-board-sources/c76-normalized-export-20260727/palm-reading-576-910-20428.png` | `6851FC738EAB224EBC49E3AA4A5FD9A7B7E3357BB58B1307A4D469B22D66816C` | 576×4272 |
| 320 | `910:20635` | `compare-board-sources/c76-normalized-export-20260727/palm-reading-320-910-20635.png` | `90B590C8EBBB8FB5E8D925A83D02CC328C9D59F6FB27EAD0CB25F9B7E8E878DE` | 320×5886 |

## Current source-to-owner contract

| C76 subtree / state | Candidate owner | Contract carried forward |
|---|---|---|
| `01-BOX` (`910:20011` at 1200; `910:20636` at 320) | `.palm-hero`, `.site-header` | Per-width header, lavender hero surface, hand artwork, title, three stars, and CTA. C76 uses an 855px desktop hero and a separately composed 870px 320 hero.
| Palm scanner article (`910:23048`) | `.palm-story` | Headline and lavender prose/list card retain source order. The alternate mobile headline is source-defined at 320.
| Questions (`910:22903`) | `.palm-questions` | Source has sun/orb carrier, question title and white four-question card; mobile order is a direct source breakpoint composition.
| `SEO CONTENT` (`910:20135`; `910:20756` at 320) | `.palm-seo`, `_unzipped/palm-reading.js` | Default state is exactly the first card open, remaining cards compact with source teaser text. Native buttons supply keyboard activation and ARIA state. No unsupported backend action is implied.
| `FOOTER` (`910:20167`) | `.site-footer` | C76 gray rounded carrier, local logo/store/payment assets, and source footer link inventory.

## Asset provenance

The candidate mounts only the already-local, source-backed asset family under `_unzipped/img/`: logo / white logo, `palm-hero-hand`, `palm-answers-orb`, store badges and payment icons. It does not download or fabricate visual assets. The source owner CSS is `_unzipped/palm-reading.owner.00.css` (SHA-256 `D45BE3EDA35B9977B8E…`); shared shell imports remain read-only and are scoped by `.palm-page`.

## Reconciliation decision

The isolated entry is a thin, explicit binding over source-owned CSS/JS rather than a stale copied cascade. Preserve sections that pass the fresh visual/runtime pass; a product mutation is permitted only for a source-proven residual.
