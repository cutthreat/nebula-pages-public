## Что опубликовано

Статический GitHub Pages preview последней верстки Nebula Account/Chatroom из изолированного Yii2-compatible эксперимента.

Пакет включает chatroom, active chat, favorites, psychics, horoscope, profile, settings и fixture/modal-сценарии. Внутренние ссылки переписаны на статические страницы preview; относительные CSS/JS/image assets проверены.

## Проверка

- 57 HTML preview pages packaged.
- Main pages and assets return HTTP 200 locally.
- Relative HTML references: 0 missing.
- Package is isolated under `nebula-account/`.

## Граница

Это client-only static preview для просмотра и кликов. Он не подключает production auth, Yii2 runtime, payment gateway, ledger/credits, message delivery, persistence или backend session lifecycle. Такие операции остаются host/API contracts.
