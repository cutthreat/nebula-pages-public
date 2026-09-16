# Transfer whitelist / blacklist

## Whitelist

- Current canonical landing entrypoints listed in `manifest/route-matrix.json`.
- Exact 32 account route-backed snapshot HTML files from `latest-routes.json`.
- Recursive local dependencies referenced by selected HTML/CSS/JS, including used fonts and raster/vector assets.
- Package launcher, manifests, contracts, verifier, server and QA evidence.

## Blacklist

- Old archives, zip files, duplicate/backup/temp/fixture pages not reached by the selected closure.
- Raw Figma caches, unrelated exports and source control metadata.
- PHP/Yii2 backend, database, log, cookie, token, OAuth, VPN or runtime secret material.
- Unused assets copied only because they exist near a source page.

Every file in `site/` is either a selected entrypoint or has a recorded dependency path in `manifest/resource-manifest.json`; package documents are explicitly marked as package-owned.
