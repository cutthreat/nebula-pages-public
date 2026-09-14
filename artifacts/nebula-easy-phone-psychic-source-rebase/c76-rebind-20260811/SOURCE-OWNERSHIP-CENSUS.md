# Phone Psychic — C76 source / ownership census (pre-write)

## Immutable source packet

`figma-manifest/truth-packets/phone-psychic-c76-source-refresh-20260720/source-refresh-manifest.json`  
SHA-256: `F008D6A0609080F6D2D69C21F68B69D7D0CEC064D7803823C9770CB2CC2B0760`

| Width | Figma root | Raster SHA-256 | Source height |
|---:|---|---|---:|
| 1200 | `912:12253` | `5FF2A895704C6A10CC8A39CF41ADF40AE0B72B66B5B8899AE3BF6B41EC2E1BF9` | 8552 |
| 992 | `912:12444` | `421F0B9B99655C2AB800D74FB3B7BAF516EFF9D136886BC907C9F47BE13BDBD8` | 8223 |
| 768 | `912:12639` | `699FCB6244E52E712E521D74DA4BAA875DD191EAE0751DDA3EB8A8E027228778` | 8649 |
| 576 | `912:12837` | `DE91E6F954408A3D46AE38723FEDED36ACC7A9956218D2C574834E31A49E6857` | 8946 |
| 320 | `912:13030` | `4705C0ED0A8E4CB3BC694E933E43D1E2F47542F2F66084EAC081298606280C72` | 10554 |

## Source-to-DOM map

| Source subtree | Current page owner | C76 contract |
|---|---|---|
| `01-BOX` / `912:12254` (1200), `912:13031` (320) | `.pp-hero`, `.pp-hero__row`, `.pp-hero__copy`, `.pp-hero__art` | Hero is 855 / 800px. 1200 copy frame is x45, y259, w541, h403; mobile copy is structurally reordered around the device artwork, not absolutely translated. |
| `03-psychic cards` / `912:12274`, `912:13045` | `.pp-experts`, `.pp-experts__grid`, `.pp-expert-card` | 1200: 3×2, 350×549, 30px rail gap. 320: 2×3, 140×377, 10px gaps. 576: 2×3, 250×437, 10px gaps. |
| `04-Clients Love` / `912:12289`, `912:13061` | `.pp-reviews`, `.pp-reviews__grid`, `.pp-review-card`, `.pp-why-phone` | Desktop shows three fixed review cards. 320 source is a clipped two-card rail (`570px` rail in a `290px` viewport); it shows no previous/next control. |
| `05-Best Online reading` / `912:12314`, `912:13089` | `.pp-scenarios` | Content/art order and source image remain breakpoint-owned. |
| `09-Situation` / `912:12336`, `912:13111` | `.pp-affordable` | 1200 title is “Affordable Conversation…”, 320 title becomes “Psychic Readings Tailored…”. |
| `01-ANSWER` / `912:15246`, `916:13466` | `.pp-faq`, `.pp-faq__item`, `.faq-section__toggle` | Eight cards; item 3 is initially expanded. Source glyph is the Figma plus asset/state, not a generic text glyph. |
| `SEO CONTENT` / `912:12356`, `912:13131` | `.pp-seo`, `.pp-seo__item` | First card is source-open; the remaining cards retain visible source teaser/rhythm, not blank unused shells. |
| `FOOTER` / `912:12394`, `912:13137` | `.site-footer` | Source container/rhythm changes from desktop multi-column to the 320 stacked version. |

## Complete residual / ownership census

| Area | Current observed owner | Census result | Disposition |
|---|---|---|---|
| Page CSS cascade | HTML head directly links four `_unzipped/phone-psychic*.css` files; isolated CSS is not loaded | Systemic isolation failure: candidate bytes cannot own or verify presentation. | Rebind head to isolated stylesheet whose ordered imports retain the immutable C76-derived source owners. |
| Page JS cascade | HTML loads `_unzipped/phone-psychic.js`; isolated JS is not loaded | Systemic isolation failure: candidate interaction contract is not its own. | Rebind to isolated JS and remove unproven review-carousel code. |
| Hero copy | `.pp-hero*` in `_unzipped/phone-psychic.01/.03.css` | Existing geometry is source-faithful by fixed section contract; no source-backed visual defect in preflight. | Preserve whole owner. |
| Advisors/cards | `.pp-experts*`, `.pp-expert-card*` in immutable source owners | Existing 1200/320 grid contract matches C76 section geometry; no rebuild justified before live proof. | Preserve whole owner. |
| FAQ glyph/state | `.faq-section__*` + `.pp-faq*` | Source requires 8 items with item 3 open. Existing generic handler must be verified after rebind; glyph must remain CSS/source asset. | Preserve DOM; verify all eight keyboard states. |
| SEO rhythm/type | `.pp-seo*` in immutable source owner plus legacy JS | The source is a mixed open/teaser state. Legacy script may collapse a source-sized teaser card into a different live state. | Isolated JS will keep source first-open state and permit only source-safe toggling. |
| Shell/footer | shared shell CSS plus page footer rules | Existing section heights match source packet in prior physical readback; no page body rewrite warranted. | Preserve; fresh five-width proof required. |
| Review control | `.pp-reviews__nav-*` + legacy `phone-psychic.js` | Figma shows no actionable prev/next control at any inspected source state; current controls are hidden/non-actionable and caused all five prior failures. | Delete control markup and its JS contract. Retain the source-visible static/clipped review composition. |

## Root cause for this bounded rebind

The candidate is a wrapper which silently executes legacy CSS/JS directly. Its own CSS/JS hashes therefore did not correspond to the rendered application, and a hidden non-source review control stayed in the testable DOM. The rebind changes ownership, not visual composition: one isolated stylesheet becomes the only page stylesheet entry point, one isolated JS module becomes the only page interaction entry point, and the non-source review control is removed.
