# Phone Psychic — final focused FAQ proof

`status: pass_static_candidate_frozen`

## Frozen product bytes

- HTML 41641 bytes — `B0C15061C7E986DA46D69EF0641D1366833A263E38562B720D2237A36993F62B`
- CSS 10535 bytes — `DFF6C8644A5058F0E2F1B12B1C81CD17EE19D116966EBB5CA28F177180F5BF87`
- JS 1663 bytes — `51034F47C904B02672CB8D65D72064A273D3F770675D6F1460B8C02D26924202`

No product byte changed during proof recovery.  The only prior CSS delta is
the page-owned neutralization of the accidental generic last-span icon match:
`background: transparent; border-radius: 0` on the FAQ text column.

## Independent visual proof

The Codex in-app browser was used in one isolated temporary tab, independent
of the stalled local Playwright process.  Its DPR is 0.8, so physical capture
widths 461 and 615 yielded exact CSS viewports 576 and 768.  Motion was
disabled only in that temporary tab; no product document was persisted.

| CSS viewport | C76 node | FAQ geometry source/live | focused Caster readback |
| --- | --- | --- | --- |
| 576 | `916:13430` | `5706 × 1060` / `5706 × 1060` | PASS — closed/open crops show no white oval; card frames, wrap and rhythm are source-shaped. |
| 768 | `916:13394` | `5564 × 1050` / `5564 × 1050` | PASS — closed/open crops show no white oval; card frames, wrap and rhythm are source-shaped. |

At both widths the live text-frame computed as transparent with 0px radius;
horizontal overflow is absent, duplicate IDs are absent, and browser console
errors are zero.  The six offscreen lazy avatar images reported no natural
width in the in-app snapshot, but all six exact local files exist and no
request failure or console error was observed; the frozen five-width runtime
proof recorded zero broken images.  This is not a page regression from the
CSS-only paint change.

Proof: `inapp-faq-proof-20260811.json`, SHA-256
`B96AF844D23D894399025643669667487003311C6F6CF338CC17560CD69A675B`.
It names and hashes 576/768 closed/open crops and their source nodes.

## Combined acceptance

The prior five-width runtime/interaction proof remains valid for 320/992/1200
and all page actions because HTML and JS hashes are unchanged:
`five-width-runtime-and-interaction-proof.json`, SHA-256
`2440D587B2238FCD621AC07F352E94441A7D17C8E1671031CE99AE409689EF67`.
Anton: **PASS** preserved by current HTML/JS hashes.  Caster: **PASS focused
FAQ source parity**.  No accepted visual residual remains for the repaired
component.

Yii2, canonical host, donor, heritage, promotion and deploy remain false.
