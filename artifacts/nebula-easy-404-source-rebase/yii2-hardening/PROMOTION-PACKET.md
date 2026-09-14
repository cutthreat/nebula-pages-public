# Nebula easy 404 — Yii2 package promotion packet

## Result

- Status: `packaged_not_host_runtime_verified`.
- Static candidate stays frozen: `nebula-easy-404.html` `2CA1B047C2599ECF8927A443898D23D07EBE44EFE06357A8DD16DD65D618CAF8`; CSS `0BBF6E3583AD76F978CD0DC33E1CAD3822BF70805CCEFBA40ED123D4D697BEFB`; JS `39E5CF6E4F65B405197EE09950D701F79BCB8389786F6609B5705D064DA75F9E`.
- Package hash: `D4224CFDF7DBE518137FB0F57678078DCB95E7F5C8D108A5D053FDBE544DF42F`.
- Package verifier: `404-yii2-package-proof-20260811.json`, SHA-256 `A8F0948070D1F0266BA2F6EC69031AF9FA552E704DFB981614B123C653BB380E`; all 14 checks pass.
- Integrity manifest: `INTEGRITY-MANIFEST.json`, SHA-256 `5821F7AD456FCC299276F5E95A5CCFEA5FE40C4D2F0F8F5FA8FF8B2E66FAB8F2`.

## Isolated Yii2 contract

- Module additions are page-owned: `Error404Asset`, `NotFoundController`, `Error404PageData`, `error404` layout, `not-found` view, `routes-404.php` and local `resources/img/404`.
- `NotFoundController` renders HTTP 404. The route fragment is intentionally not merged into the shared module route list or a host `urlManager`.
- CSS is the frozen source copy except for four font URL relocations into `@nebulaLanding/resources`; JS is root-scoped to `[data-nebula-error404]` and preserves menu Escape/focus return and theme behavior.
- There is no host-side public-shell contract in the approved roots to adopt safely; no Home, Aura, Love, Psychic, Taurus, shared shell or static candidate file was changed.

## Exact host-mount boundary

The approved implementation and canonical roots have no `composer.json`, `yii` entrypoint or `config/web.php`. Before promotion, the canonical host owner must provide:

1. exact host root and module registration for `app\\modules\\nebulaLanding\\Module`;
2. one complete 21-key `routeMap`, including public targets used by the 404 view;
3. an explicit merge of `config/routes-404.php` into the host `urlManager` and ownership decision for the HTTP 404 route;
4. host public-layout adoption or a parity-approved page layout decision;
5. live `/404` HTTP and five-width runtime proof.

Until then: `donor=false`, `promotable=false`, no canonical-host, deployment or backend claim.
