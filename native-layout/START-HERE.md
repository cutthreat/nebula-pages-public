# Nebula native layout package

Дата сборки: 2026-09-16T14:29:52.476Z

1. Откройте [site/index.html](site/index.html) для текущего public home.
2. Откройте [site/nebula-account/index.html](site/nebula-account/index.html) для индекса 32 account route-backed snapshots.
3. Для проверяемой упаковки и ограничений читайте [README.md](README.md), [manifest/native-layout-manifest.json](manifest/native-layout-manifest.json) и [manifest/route-matrix.json](manifest/route-matrix.json).
4. Локальный static preview: `node TOOLS/serve-native-layout.mjs --root site --port 4188`.
5. Проверка closure/link/JS: `node TOOLS/verify-native-layout.mjs`.

Граница: это переносимый статический HTML/CSS/JS/resource package. Yii2/backend, auth, billing, realtime, persistence и production readiness здесь не заявляются.
