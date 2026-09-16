# Nebula full layout — HTML/CSS/JS code archive

Это отдельный компактный Git-пакет для Игоря и другой Codex-среды. В него включены все исходные HTML, CSS и JavaScript-файлы из `SOURCE/FULL-LAYOUT-SOURCE`, а также JSON/Markdown-контракты, route manifests, SVG и шрифты, необходимые для аудита структуры и подключения верстки к Yii2.

## Что внутри

- полный набор HTML-макетов, включая личный кабинет, chatroom, auth/menu, home и landing-страницы;
- CSS, JS, CJS/MJS и route/config manifests;
- handoff-контракты, Figma/source notes и инструкции для Codex;
- SVG, favicon и шрифты.

Растровые медиа (`png`, `webp`, `jpg`, `jpeg`) и runtime/backend-кэши намеренно не дублируются в этом Git-файле: они остаются в полном transfer-пакете и в опубликованном static release. Полный пакет со всеми ресурсами: `nebula-codex-transfer-20260915-qa3.zip`.

## Источник и проверка

- source snapshot: `nebula-gpt` / `SOURCE/FULL-LAYOUT-SOURCE`;
- package generated: 2026-09-16;
- точный список файлов и SHA-256: `FULL-LAYOUT-CONTENTS.json`;
- этот archive предназначен для source/code handoff, а не для доказательства backend, платежей, realtime, persistence, RBAC или production runtime.

Для визуального просмотра используйте опубликованные страницы из `nebula-pages-public`, например `nebula-account/chatroom.html`, `profile.html` и `horoscope.html`.
