# Palm Reading — bounded source receipt

- Unit: `landing_public/palm-reading-source-rebase` (money page); existing `palm-reading-new.html` is a read-only baseline, not a promoted donor.
- C76 packet: `figma-manifest/truth-packets/palm-reading-c76-source-refresh-20260720/source-refresh-manifest.json`, SHA-256 `719A420EF69A86DCCD5FB652D7E7F73AE4C3EA63A25B2CB0ED597CC1A6634B73`.
- Exact roots/raster contracts: 1200 `910:20010` / `1200x4392` / `9C5ED6D9EA914A1FBBF8363859A82BB00CA389F37222957FF2374FB8E10C0EC6`; 992 `910:20217` / `992x4297` / `7345DAB94707039DA6A2A3D314CF0AC8E19650528B960EFBF9B56B6DC4011F59`; 768 `910:19799` / `768x4345` / `F50C73949261191B832E9B4897A03F6F8EB7017F3E7728D485F29B87A4996CF3`; 576 `910:20428` / `576x4272` / `6851FC738EAB224EBC49E3AA4A5FD9A7B7E3357BB58B1307A4D469B22D66816C`; 320 `910:20635` / `320x5886` / `90B590C8EBBB8FB5E8D925A83D02CC328C9D59F6FB27EAD0CB25F9B7E8E878DE`.
- Exact paths: `H:/Nebula/GPT/compare-board-sources/palm-reading-c76-{1200,992,768,576,320}.png`.
- Proposed isolated write set if rebase is explicitly required: `nebula-easy-palm-reading.html`, `nebula-easy-palm-reading.css`, `nebula-easy-palm-reading.js`, `artifacts/nebula-easy-palm-reading-source-rebase/**`. No writes to legacy, Home, Aura, Love, Psychic, Tarot, Taurus, shared, host or deploy.
- Baseline proof is read-only against `http://127.0.0.1:8765/_unzipped/palm-reading-new.html`; it matches the source frame heights at all five widths. It does not make the legacy page accepted or promotable.
