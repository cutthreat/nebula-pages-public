# Latest account layout snapshot

This directory was regenerated from the live local Yii2 host at
`http://127.0.0.1:8173` on 2026-09-15.

Source of truth:

- module: `implementation/nebula-gpt/experiments/nebula-account-chat-live-20260809/yii2/modules/nebulaAccount`
- host mapping: `implementation/nebula-gpt/host/yii2/config/web.php`
- route manifest: [latest-routes.json](latest-routes.json)
- export command: [export-local-account-snapshot.ps1](../tools/export-local-account-snapshot.ps1)

The snapshot contains 32 successful account routes. `chatroom.html` is the
Mia Jacomo catalogue entry state from
`/nebula-account/chatroom?expert=mia-jacomo&entry=catalogue`.

Standalone modal/state HTML files that are not direct Yii2 GET routes remain
under `nebula-account/` as handoff fixtures (for example active chat,
checkout and consultation states). They are state fixtures from the same
current module, not a second published build or an alternative source of
truth; the route-backed files and `latest-routes.json` define the canonical
latest snapshot.

GitHub Pages serves the HTML/CSS/JS projection only. Yii2 integration routes,
payments, persistence, realtime delivery and RBAC are backend handoff items;
they are not represented as production claims by this static snapshot.

Export integrity: the published module CSS/resources are synchronized from the
current live module resource tree. The exporter is parameterized by
`-SourceRoot`, copies the full asset/resource closure, pins `?v=20260915`, and
removes live local CSRF values from the static projection.
