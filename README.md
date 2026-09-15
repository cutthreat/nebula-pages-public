# Nebula account and paid-chat demo

The published account build is the latest static projection captured from the
local Yii2 host at `127.0.0.1:8173`. The source mapping and complete route list
are recorded in [nebula-account/LATEST-SOURCE.md](nebula-account/LATEST-SOURCE.md)
and [nebula-account/latest-routes.json](nebula-account/latest-routes.json).

Open `nebula-account/psychics.html` for the catalogue, and
`nebula-account/chatroom.html` for the current Mia Jacomo chat state. The
repository includes the matching HTML, CSS, JavaScript, fonts and image
resources used by the snapshot.

The screens implement frontend demo scenarios only. Payment, billing, message persistence,
realtime delivery, service-session creation and RBAC require the separate Yii2/backend handoff.

See [QA-REPORT-2026-09-15.md](QA-REPORT-2026-09-15.md) for the evidence-bound QA scope,
the confirmed JavaScript repair and the remaining NOT PROVEN backend claims.
