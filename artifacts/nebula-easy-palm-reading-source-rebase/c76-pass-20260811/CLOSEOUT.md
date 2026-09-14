# Palm Reading source-first static unit — closeout

## Status

`pass_static_candidate_frozen`

## Reconciliation and implementation

- Current C76 source and current isolated candidate were reconciled before any product write.
- C76 manifest: `figma-manifest/c76-normalized-export-20260727/palm-reading.json`, SHA-256 `F9188F6EB1BC9E807F92AA1E84B891CE2CFE7DBC0925363E64381720679D4897`.
- Figma contexts were read for root nodes `910:20010` (1200) and `910:20635` (320); the current local five-raster packet is the authority for all widths.
- No page HTML/CSS/JS repair was warranted. Product bytes remain unchanged; only task-local source map, runner and fresh proof artifacts were added.

## Five-width verification

| Width | C76 node | C76 source SHA-256 | Source / live height | Runtime |
|---:|---|---|---:|---|
| 1200 | `910:20010` | `9C5ED6D9EA914A1FBBF8363859A82BB00CA389F37222957FF2374FB8E10C0EC6` | 4392 / 4392 | pass |
| 992 | `910:20217` | `7345DAB94707039DA6A2A3D314CF0AC8E19650528B960EFBF9B56B6DC4011F59` | 4297 / 4297 | pass |
| 768 | `910:19799` | `F50C73949261191B832E9B4897A03F6F8EB7017F3E7728D485F29B87A4996CF3` | 4345 / 4345 | pass |
| 576 | `910:20428` | `6851FC738EAB224EBC49E3AA4A5FD9A7B7E3357BB58B1307A4D469B22D66816C` | 4272 / 4272 | pass |
| 320 | `910:20635` | `90B590C8EBBB8FB5E8D925A83D02CC328C9D59F6FB27EAD0CB25F9B7E8E878DE` | 5886 / 5886 | pass |

Fresh runner checks: local HTTP, current source identity, all images, overflow, console/page/request failures, duplicate IDs, CTA focus/route, visible SEO keyboard states, mobile menu keyboard state, visible static links and reduced motion.

## Proof references

- `SOURCE-SUBTREE-MAP.md`
- `five-width-runtime-proof.json`
- `hero-source-live-split.json`
- `split-{1200,992,768,576,320}-hero.png`
- `live-{1200,992,768,576,320}-{hero,story,questions,seo,footer}.png`
- `CASTER-ANTON-CLASSIFICATION.md`

## Accepted residuals / boundary

There are no material static visual or interaction residuals. Canonical Yii2 host mount, server route registration, real signup/consultation backend, donor/heritage designation, promotion and deploy are explicitly untested and false.

## Next action

Freeze this isolated candidate. Head may run a separate read-only source receipt for the next unaccepted public landing; do not modify this Palm page without a new bounded recovery decision.
