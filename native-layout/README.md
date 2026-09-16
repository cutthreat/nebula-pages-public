# Nebula native layout — portable package

Это отдельный пакет для Igor/Astra: source-backed static HTML/CSS/JS с замкнутыми локальными ресурсами и доказательствами QA. Исходный implementation checkout и старые архивы не изменялись и внутрь пакета не копировались.

## Структура

- `site/index.html` — текущий canonical public home.
- `site/<landing-route>/index.html` — 33 текущих landing route pages.
- `site/nebula-account/*.html` — ровно 32 route-backed account snapshots плюс package navigation index.
- `site/_unzipped/` — только CSS/JS/fonts/images/media, достигнутые closure-анализом landing pages.
- `site/yii2/modules/nebulaAccount/resources/`, `site/assets/`, `site/resources/confideline-public-base/` — только ресурсы, фактически достижимые account pages.
- `manifest/` — file/resource/route manifests.
- `contracts/` — whitelist, Yii2 boundary и claim ceiling.
- `proof/` — baseline, static closure, MISSING-REPORT reconciliation и QA receipts.
- `TOOLS/` — dependency-free static server и verifier.

## Запуск

Из корня этого пакета:

```powershell
node TOOLS/serve-native-layout.mjs --root site --port 4188
```

Затем откройте `http://127.0.0.1:4188/index.html` или `/nebula-account/index.html`. Для офлайн file:// preview используйте только как дополнительный smoke-check: основной verifier использует HTTP, чтобы обнаруживать реальные resource requests.

## Source/Yii2 boundary

Canonical page/source truth: `F:/CodexProjects/confideline-nebula/implementation/nebula-gpt` at `01d98d78d40d177623dc0f2a55acd19db377f957` on `codex/kimi3-nebula-layouts-20260818`. Account static snapshots were taken from the read-only public static release reference `9ac10fb446fe66c985b769ad2f26e70fbece1d18`; the local Yii2 reference is `http://127.0.0.1:8173`. The package does not include PHP/backend code and does not turn static route snapshots into live Yii2 routes.

## Route policy

- `home.html` is treated as an old/alternate source; package links normalize it to `site/index.html`.
- The five MISSING-REPORT names `advisor-chat.html`, `press.html`, `reviews.html`, `support.html`, `trust.html` are source-blocked and intentionally not fabricated.
- The ten old names with current `-new.html` variants remain policy entries only; backend/route owner must choose an alias.
- Account dynamic route literals are normalized to same-directory package files; this does not claim backend behavior.

## Claim ceiling

Verified scope is portable static layout and the recorded link/resource/responsive/interaction checks. Backend auth, billing, credit debit, realtime, persistence, owner authority, deployment and production readiness remain unproven.

Generated inventory: 888 served files, 170948858 bytes before docs/proof.
