# landing_public/faq-source-rebase — source receipt

Status: `source_confirmed_static_pass_started`  
Source authority: `figma-manifest/truth-packets/faq-91ku-source-publication-20260716/source-publication-manifest.json` (`published_exact_source`, `acceptance_status=not_accepted`).

## Exact five-width source

| width | Figma node | source raster | SHA-256 |
| --- | --- | --- | --- |
| 1200 | `866:7108` | `compare-board-sources/faq-91ku-1200.png` | `560F37B9E6186EBDEA8D0F42ACBBC3306B2FBA71410193445D8143A511CD4203` |
| 992 | `866:7511` | `compare-board-sources/faq-91ku-992.png` | `51D61C9E2D7E5B2D5893D4B8A6D3BE37FAA6751B9D57B5A874B15D78283CB5B7` |
| 768 | `868:7221` | `compare-board-sources/faq-91ku-768.png` | `8D189453B5FD72E5F5CFD71133D52F54D10E86603FF8D677DE41B04AC6B6A00C` |
| 576 | `868:7775` | `compare-board-sources/faq-91ku-576.png` | `9B6021830024239B08043CFD4783232B355412C0DBB64AF64CBC4CED6FD021E7` |
| 320 | `868:8218` | `compare-board-sources/faq-91ku-320.png` | `AF2D8C27677076235C94368DC2B3D856363640DA1A580A64C6C2F9DF836DAF40` |

## Asset and copy contract

- Copy and source structure come only from `_unzipped/faq-new.html` (`C737C24064CA447AEAE70B4A0BD3093FE148F66993D31924BBB12A53A123D521`). No fabricated sections or text.
- Styling and interactions are mechanically rebased from `_unzipped/faq-new.css` (`AA66352453BF52A4C50EF7F15789CEBECF3B172C1B33AB90549A9AC8C1DAD729`) and `_unzipped/faq-new.js` (`28C100CB8DA579E3F990478AD171DC27423FE9896FB883E51E0DDF1061A7CC7B`). Local relative assets continue to resolve only under `_unzipped/`; no downloaded or remote image is permitted.
- `bootstrap.css` and `oracle-shared-shell.00/.01.css` are read-only source dependencies; no shared file is changed.

## Isolated write boundary

Allowed: `nebula-easy-faq.html`, `nebula-easy-faq.css`, `nebula-easy-faq.js`, and `artifacts/nebula-easy-faq-source-rebase/**`.

Forbidden: `faq-new.*`, Home, Aura, Love Reading, Psychic Reading, Palm, Taurus, Privacy, All Psychics, shared source files, canonical host/Yii2, and deploy.

## Static-pass acceptance boundary

The pass must capture direct source/live comparisons at 1200/992/768/576/320 and check source assets, horizontal overflow, console/runtime, menu and FAQ accordion behavior. This receipt authorizes only an isolated static candidate; it does not authorize host mounting, Yii2 packaging, donor or promotion status.
