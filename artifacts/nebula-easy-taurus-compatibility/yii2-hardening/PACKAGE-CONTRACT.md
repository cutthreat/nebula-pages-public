# Taurus Compatibility — isolated Yii2 package contract

Status: `package_ready_host_mount_pending`.

The frozen static page maps to a future page-owned `nebulaLanding` package only:

- controller route intent: `/taurus-compatibility`;
- view: source-bound page body with the host public layout selected by the canonical host owner;
- `AssetBundle`: only Taurus CSS/JS and local source assets, using bundle aliases;
- links/assets: `Url::to()` and bundle URLs; content must remain structured-safe with `Html::encode()` for dynamic data;
- interactions: namespace the page module, preserve native keyboard/focus and reduced-motion behavior;
- host intent: bind consultation and video controls only after the canonical host supplies their routes/media; do not turn the static state into a fake completed booking or player.

Not performed: canonical host mount, module registration, routeMap/urlManager mutation, backend signup/media binding, deploy or donor promotion.
