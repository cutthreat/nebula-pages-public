# Nebula easy — 404 source rebase

status: `pass_static_candidate_frozen`

## Source and scope

- C76 manifest: `figma-manifest/c76-normalized-export-20260727/404.json`, SHA-256 `740397CE2DDA22FA53220F93ECF961BEDF0AC1212C222C3617F3FAB4945F377C`.
- Exact source nodes: `1064:23227` (1200), `1064:23394` (992), `1064:23542` (768), `1064:23692` (576), `1064:23839` (320). The final node is the verified 404 sibling despite its historical `BLOG INPUT 1204` frame label.
- Changed only `nebula-easy-404.html`, `nebula-easy-404.css`, `nebula-easy-404.js` and this task-local artifact tree.

## Caster visual gate

`pass_visual_source_parity`.

The page has a single calm recovery route: exact 404 artwork is the dominant mass, source-shaped heading/copy follow it, and the CTA is the only accent action. The source footer begins at the same transition point across all five contracts. Full-page heights are `1369/1425/1549/1379/1834` against C76 `1370/1420/1550/1380/1835`; the only +5 px difference is 992 footer rasterization and is non-blocking.

Typography, artwork clipping and footer column/order follow the five source contracts; the 320 artwork is a real node export, not a screenshot crop. The component is page-owned and has no inherited page cascade or shared-file change.

## Anton product gate

`ready_static_candidate`.

- `Explore our site` is an actual keyboard-accessible link and navigates to local `home.html` with HTTP 200 at all five widths.
- Menu opens via keyboard and closes with Escape. The visible shell theme switch changes both ARIA state and the page state. Native links resolve to existing local files; no `href="#"` is present.
- Runtime found zero overflow, broken images, console errors, request failures and duplicate IDs. The run uses reduced motion.

## Boundaries and residuals

- `non_blocking_visual_tolerance`: 992 full-page height is +5 px; all other source/live height residuals are -1 px.
- Static candidate only. Yii2 host mount, donor/heritage, promotion, deployment and external-store navigation are not claimed.

## Proof

- Fresh postimages: `postimage/live-1200.png`, `live-992.png`, `live-768.png`, `live-576.png`, `live-320.png`.
- Runtime/action proof: `postimage/five-width-runtime.json`, SHA-256 `F4BA9184BC51991DB3CCF5BFE0D05514CCF968AE1A0E303C9878FD64BB2075B7`.
- Product hashes: HTML `2CA1B047C2599ECF8927A443898D23D07EBE44EFE06357A8DD16DD65D618CAF8`; CSS `0BBF6E3583AD76F978CD0DC33E1CAD3822BF70805CCEFBA40ED123D4D697BEFB`; JS `39E5CF6E4F65B405197EE09950D701F79BCB8389786F6609B5705D064DA75F9E`.
