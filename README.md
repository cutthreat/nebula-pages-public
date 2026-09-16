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

The release is a static projection, not the Yii2 source module. The canonical source module,
host requirements, backend boundary and transfer instructions are in the separate Codex transfer
packet. The current projection has 32 route-backed account screens; standalone state fixtures in
`nebula-account/` are not additional route inventories.

The export script is portable: pass `-SourceRoot <implementation-root>` and, when regenerating,
use `-CopyAssets`. It copies the complete current asset/resource closure, pins the preview asset
version, and replaces local CSRF tokens with `static-preview-csrf-token`.

See [QA-REPORT-2026-09-15.md](QA-REPORT-2026-09-15.md) for the evidence-bound QA scope,
the confirmed JavaScript repair and the remaining NOT PROVEN backend claims.

## Full HTML/CSS/JS handoff

The separate [full-layout code archive](full-layout/nebula-full-layout-code-20260916.zip)
contains the complete HTML/CSS/JS source snapshot plus route manifests and handoff
contracts for Codex/Yii2 integration. Its file inventory and SHA-256 values are in
[FULL-LAYOUT-CONTENTS.json](full-layout/FULL-LAYOUT-CONTENTS.json). Raster media are
kept in the published static tree and in the full transfer package; this Git archive
is the code handoff, not a backend or production-runtime claim.
