# Taurus Compatibility — terminal acceptance residual ledger

- Overall acceptance: `not_pass`
- Visual parity: `pass`
- PM / full-funnel: `blocked`
- Caster: `direct_repair`
- Anton: `blocked_p1_action_honesty`
- Yii2 hardening: `not_started_due_acceptance_gate`
- Donor / heritage / promotion / deploy: `false`
- Product files changed by this acceptance pass: `none`

## Evidence reviewed

- Source/live: `splits/taurus-{1200,992,768,576,320}-source-live.jpg`
- Runtime: `runtime-proof.json` — `85DE3B56106BE3620871FB31A67C2716C35B03E51DF8AF2BB3EF9B8ECF1289B2`
- Visual: `visual-proof.json` — `85A6BB8DCA5DE118D6C62DA2F8977CD61E9912D8508B1A2FCBD9F77B8080FBBC`
- Independent reviewers: Caster agent `019fe890-3ebf-75f3-9adb-d8f1833d69b0`; Anton agent `019fe890-5c80-7e72-b2d7-8da06b94e296`.
- Route audit: all local `.html` destinations referenced by the candidate were requested from `http://127.0.0.1:8765/`.

## Accepted layer

- 1200/992/768/576/320 composition, typography, assets and responsive geometry are visually close to C76.
- Page-height delta is 0–1 px; horizontal overflow and measured section overflow are 0.
- 28/28 images load; console, page and request errors on the candidate route are 0.
- Correct semantic zodiac labels are retained instead of the erroneous repeated `ARIES` labels in the 1200 source raster.

## Blocking residuals

### TAU-ACC-P1-001 — raster CTA is not actionable

- Severity: `P1`
- Evidence: both `START MY FREE CONSULTATION` banners are `<picture>` elements, not links or buttons.
- Impact: a visually dominant action cannot be activated by mouse, touch or keyboard and has no destination receipt.
- Acceptance repair: expose a semantic CTA with a verified destination while preserving the accepted banner geometry.

### TAU-ACC-P1-002 — fake video action

- Severity: `P1`
- Evidence: the `Play Taurus compatibility video` button only toggles `is-active`; no video, audio, iframe, media source or meaningful visible state exists.
- Impact: the control promises playback that does not occur.
- Acceptance repair: bind a real approved media source and states, or remove the control semantics and present the artwork honestly as non-interactive.

### TAU-ACC-P1-003 — navigation destinations return 404

- Severity: `P1`
- Failed local routes: `all-psychics-new.html`, `articles-new.html`, `charts-new.html`, `zodiac-signs-new.html`.
- Impact: primary desktop and mobile navigation contains dead destinations.
- Acceptance repair: bind each label to a real canonical route and verify transport plus rendered landmark.

### TAU-ACC-P1-004 — four FAQ controls reveal no answer

- Severity: `P1`
- Evidence: FAQ panels 1, 2, 4 and 5 are empty; only panel 3 contains an answer. Existing runtime proof exercised only panel 3.
- Impact: four apparently valid disclosures perform an empty state and weaken content trust.
- Acceptance repair: populate source-approved answers or remove/disable unsupported questions; run a five-item sibling sweep.

## Nonblocking but required before production claim

### TAU-ACC-P2-005 — placeholder links

- `Taurus` and `Elena Lubimova` link to `#`.
- Replace with real routes or render as non-link text.

### TAU-ACC-P2-006 — menu accessibility proof incomplete

- Boolean open/close and Escape behavior are proven.
- Visual open-state proof, keyboard entry/order, focus containment and focus return are not proven.
- Evidence ceiling: `expert_proxy_only`; `conformance_not_claimed`.

## Yii2 boundary

- An isolated package exists at `integrations/yii2/nebulaLanding`, currently for Love Reading.
- No canonical host application (`composer.json`, configured Yii2 web entry/runtime and owning route map) was found in the bounded implementation/canonical check.
- Because acceptance did not pass, no Taurus controller/view/data/AssetBundle/routes were added.
- Future state remains `blocked_before_yii2_hardening`, not `package_ready_host_mount_pending` for Taurus.

## Terminal decision

`visual_parity_pass / interactive_full_funnel_acceptance_failed`.

No Yii2 packaging, donor/heritage promotion, deploy or further product mutation is authorized in this unit. The next bounded repair must address TAU-ACC-P1-001 through TAU-ACC-P1-004 and then rerun five-width default/state proof plus Caster and Anton.
