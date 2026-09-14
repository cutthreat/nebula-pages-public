# Mia Jacomo — самостоятельная frontend-проекция

Статус: самостоятельный HTML/CSS/JS и его локальные зависимости собраны; 12 source/static проверок прошли. Текущий независимый canonical File Plan после исправления JPEG прошёл 2026-09-07: пять ширин, `static_safe=true`, 427 source identities, отсутствующих/внешних/серверных зависимостей и blockers нет. Визуальная и продуктовая приёмка не выполнена. Полная цель Cabinet + Chat остаётся открытой.

> **Continuation addendum 2026-09-10.** Этот документ сохраняет baseline standalone-пакет 2026-09-07. После него текущий Yii source был обновлён для Mia responsive-repair; актуальные SHA и structural source lock проверяются `proof/verify-mia-standalone.cjs`, а rendered/interaction evidence находится в `artifacts/mia-current-20260910/`. Не использовать старые утверждения о неизменности view/CSS как описание текущего runtime.

## Точка входа и состав

- `preview/mia-jacomo.html` — статическая страница, без PHP, Yii2, proxy или backend requirement. Открывается как локальный HTML; текущий batch браузер не запускал.
- `preview/mia-jacomo.js` — только локальные FAQ, избранное, демонстрационный booking и сообщения о необходимости интеграции. Без запросов, хранения, auth, presence, оплаты и отправки бронирования.
- `resources/confideline-public-base/app.min.css`, `jquery.js`, `bootstrap.bundle.min.js` — точные публичные bytes Confideline. Bootstrap CSS 4.6.0, Bootstrap JS 4.1.3, jQuery 3.7.1 — это подтверждённая текущая база, не обновление версий.
- `resources/fonts/feather` и `resources/images` — 395 точных публичных transitive ресурсов темы, 5 251 461 байт. Все получены через ограниченный HTTPS intake без cookies/redirects и проверены по SHA и типу файла. CSS темы не переписывался.
- Общие CSS, картинки, Manrope и account-header.js используются по относительным ссылкам из существующего `yii2/modules/nebulaAccount/resources`. Имя папки `yii2` не создаёт зависимости от PHP. HTML нельзя передавать отдельно от его локальных ресурсов.
- Соседние ссылки ведут на существующие HTML-превью. Эти страницы данным batch не пересертифицированы. Psychic catalogue, консультация и пополнение показывают явный integration-required notice.
- `proof/verify-mia-standalone.cjs` проверяет точный набор локальных зависимостей, SHA источников, five-width binding и JS-логику без браузера. Команда: `node proof/verify-mia-standalone.cjs` из папки эксперимента. JSON stdout содержит локальные пути и SHA для упаковки.

Порядок CSS: public app.min.css → profile.css → account-header.css → psychic-card-v2/css/psychics.css → booking-session-v1/css/booking-session.css. Это описание baseline-пакета 2026-09-07. В текущем source CSS сохранён JPEG/JFIF без перекодирования (фон `psychic-card-background-c76.jpg`, SHA изображения `438EFABFC045A242D4B910D0E53DF126BFBEB765482D851F6EFB2B96A3049533`), но geometry/source CSS и view с тех пор получили отдельный Mia responsive-repair. Current CSS SHA `10A95C27A4A801BDF1C9AC9703BEB1CEDD3D067F19A5D6536BCDD7447BCEF3EB`; current view SHA `F7EB8E5E31E946178E4DD56DE2D1CB6E667C0698AC1C3CC4AD0278C6DD9D2648` (после post-copy обновления 2026-09-12). Детали JPEG baseline — `proof/mia-jpeg-packaging-receipt.json`; current rendered proof — `artifacts/mia-current-20260910/READBACK.md`.

## Происхождение и проверка

Разметка: текущие `views/psychics/view.php`, `views/partials/account-topbar.php`, `views/partials/booking-session.php`; данные Mia из `PsychicsController.php`: Busy, рейтинг 4.1, 211 отзывов, 16,752 консультаций, 9 лет, 3 free minutes, 45 credits/min, favorite=true. Это перенос текущей frontend-модели, не доказанные backend-данные.

Figma C76M54fY7z926wIQoWFh8Y: 1200=1095:28955; 992=1415:44362; 768=1415:45424; 576=1415:45976; 320=1415:46525. Использованы уже сохранённые точные exports в `source/psychic-card-c76-20260907`; новых exports нет. Источник показывает Margo, текущая продуктовая проекция — Mia; это различие не скрывается.

Только `expert-page.pageSrc` существующего compare catalog перенаправлен на этот HTML. Canonical coverage пересобран существующим builder: 66 страниц, 330 строк, 89 exact, 241 pending, 0 missing; verifier PASS, 0 issues. Пять identities сохранены. Этот PASS означает согласованность источников, не pixel parity.

Public base provenance: `artifacts/layout-contour-audit-20260907/CONFIDELINE-PUBLIC-ASSET-INTAKE.json` в корне implementation. Все три копии SHA-exact. Все 395 дополнительных ссылок из точного CSS теперь локализованы; происхождение и SHA — в `proof/mia-theme-closure-receipt.json`. Четыре font URL с исходным query `t=1501841394106` дают те же bytes. Полный проверенный перечень 433 локальных файлов — `proof/mia-standalone-verification.json`. Замкнут набор зависимостей этой страницы и её CSS, а не всех страниц сайта Confideline.

## Контракт интеграции Yii2 для программиста

Историческая приёмка локального Plan: `artifacts/layout-contour-audit-20260907/MIA-POST-FORMAT-PLAN-ACCEPTANCE.json` в корне implementation, SHA `341B914B280BD98D1D4FB0CBA83929D7BCD34E7677FF0EB1C6A896F1617F41F0`; полный canonical Plan — `MIA-POST-FORMAT-CANONICAL-PLAN.json` рядом, SHA `B03AC2190660ECDA4B364235EDA5816B22C54EA3815F78977A21C97B1B6C4B28`. Один разрешённый Head запуск аудитора, exit 0, 16.459 s, без `-Run`, browser или изменения продукта. Этот baseline Plan связывает CSS `AF769...B8C4` и JPEG `438E...9533`; текущий source lock и rendered proof указаны в continuation addendum выше. 427 identities Plan и 433 файла owner-проверки — отдельные перечни разных проверок.

1. Сохранить DOM-классы, data hooks, порядок assets и адаптивные правила; заменить статические значения экранированными данными view/model. Существующие исходные PHP view и AssetBundle остаются ориентирами интеграции.
2. Подключать jQuery/Bootstrap один раз через зависимости AssetBundle, не дублировать проектную базу и не обновлять версии без отдельной проверки. Общие CSS оставить перед page-specific CSS.
3. Связать navigation с реальными Url::to-маршрутами. Backend-required действия должны получить реальные endpoints, CSRF, проверки доступа/валидацию и состояния ошибки/ожидания. Статические notices не являются реализацией этих функций.
4. Избранное в standalone меняется только в памяти страницы; событие `nebula:psychic-favorite-intent-required` сообщает `persisted:false`, `backendRequired:true`. Адаптер persistence не реализован.
5. Booking открывает существующую оболочку, но не создаёт доступные даты, не отправляет заявки/уведомления. Кнопка submit отключена. Для реального календаря нужны данные доступности и подтверждённый backend-контракт.
6. Не подключать account/auth/session/analytics/presence scripts к статическому артефакту. Проектный `profile.js` и текущий `psychics.js` намеренно не подключены; у последнего имя Margo жёстко задано. В отдельной frontend-проекции имя берётся из Mia data attribute.

## Незакрытые вопросы

- Исторический blocker 395 theme refs из `MIA-STANDALONE-PREVIEW-PLAN.json` закрыт добавлением реальных ресурсов, без изменения CSS темы/планера. Исторические owner-квитанции в `proof/` не заменяют текущий post-format canonical Plan, указанный выше.
- **Continuation correction 2026-09-10:** текущее браузерное наблюдение уже снято на 1200/992/768/576/320 и дополнено seam-capture на 1200/1199/992/991/768/767/576/575/320; runtime доказал HTTP 200, отсутствие console/page errors и overflow. Supplemental native-runtime geometry parity ([GEOMETRY-PARITY.json](../../../artifacts/mia-current-20260910/GEOMETRY-PARITY.json)) подтверждает source-backed размеры hero/About/banner на 5/5 ширинах; это не заменяет визуальную приёмку.
- **Rendered review board 2026-09-10:** [COMPARE-BOARD.html](../../../artifacts/mia-current-20260910/COMPARE-BOARD.html) показывает актуальные current PNG рядом с точными Figma exports на всех пяти ширинах; [VISUAL-REVIEW-PACKET.json](../../../artifacts/mia-current-20260910/VISUAL-REVIEW-PACKET.json) фиксирует node IDs, SHA и claim ceiling. Это не заменяет owner visual acceptance.
- **Fresh runtime recheck 2026-09-10:** после восстановления локального host live capture выполнен в `2026-09-10T14:46:22.741Z`, geometry в `2026-09-10T14:47:05.856Z`, interaction smoke в `2026-09-10T14:50:49.560Z`: 10/10 ширин, 70/70 checks, HTTP 200, 0 failed responses и 0 console/page errors. Один transient 404 из предыдущего прогона не воспроизведён и не принят как продуктовый результат; полный readback — в `artifacts/mia-current-20260910/INTERACTION-SMOKE.json` и `READBACK.md`.
- **Surface probe 2026-09-10:** read-only GET к catalogue, Mia profile и chatroom дал HTTP 200 без PHP leak; подробности и claim ceiling — в `artifacts/mia-current-20260910/SURFACE-PROBE.json`. Это не backend/auth/payment/persistence proof.
- История: первая owner-проверка Plan после JPEG path correction остановилась на `stable_preview_python_capability_unavailable`: оба Python-runtime завершены по `owned_process_total_deadline`, wrapper exit 1. Эта ошибка сохранена в `proof/mia-jpeg-packaging-receipt.json` и `proof/mia-standalone-preview-plan.json`. После отдельного разрешения Head аудитор выполнил один новый canonical File Plan — PASS; прежний timeout больше не является текущим blocker. Исполнитель продукта Plan повторно не запускал.
- Node VM с минимальными DOM-имитаторами остаётся ограничением source-only verifier; фактические DOM/focus/overflow-ветви дополнительно покрыты текущим `INTERACTION-SMOKE.json` (70/70 PASS), но это всё ещё не owner visual acceptance.
- В baseline-статике первый отзыв упоминает Margo; текущий Yii view содержит отдельную Mia layout/content projection. Этот batch не заменяет редакторскую и source-parity работу.
- Ранее зарегистрированные долги Cabinet + Chat не закрываются данным артефактом.
- Старый PHP-served compare subset не обновлялся и не должен использоваться как доказательство новой статической страницы. Новый binding находится в canonical catalog.

Откат batch: восстановить только три catalog/coverage preimage из `proof/mia-standalone-preimages-20260907`, после проверки отсутствия последующих чужих изменений; новые файлы принадлежат этому standalone batch. Автоматического удаления/отката не выполнялось.

Ponytail: использованы существующие preview, CSS/assets, compare и coverage builder; без нового сервера, framework, engine и CSS repair stack.

## Catalogue continuation addendum — 2026-09-10

Отдельный bounded packet исправил mounted `Psychic of the day` на `/nebula-account/psychics`. Source owner выбран по локальному C76 layer index: `1413:35168`/`1440:44202` (1200), `1414:35631`/`1441:44405` (992), `1414:37323`/`1441:44497` (768), `1441:44586`/`1441:44692` (576), `1441:44889`/`1441:45197` (320). Whole-page `1414:35542` и isolated `1134:33234` отклонены как владельцы этой секции.

В `yii2/modules/nebulaAccount/views/psychics/index.php` пять source-тегов `Tarot reading`, `Psychics`, `Tarot reading`, `Clairvoyance`, `Angel reading` теперь anchors с существующим `Best Online Psychics` collection route и `data-collection-tag`; лишние мобильные/артефактные tags удалены. В v3 CSS обновлены source refs и исправлен 576px owner width на `100vw`; 1200/992/768/576/320 geometry сохранена по C76 contract.

`artifacts/psychic-of-day-catalogue-20260910/CAPTURE.json` перегенерирован `2026-09-10T15:58:07.600Z`: 5/5 geometry, tags и clicks PASS; 0 overflow, 0 runtime/request failures. Первый одиночный failed request к `margo-day-c76.webp` не воспроизвёлся после HTTP 200 asset probe и повторного capture. Детальный [READBACK](../../../artifacts/psychic-of-day-catalogue-20260910/READBACK.md) содержит claim ceiling и visual evidence.

Seam capture `SEAM-CAPTURE.json` на `1199/991/767/575` дал 4/4 rows PASS, 0 overflow и 0 runtime/request errors; это подтверждает поведение media-boundaries рядом с пятью основными ширинами.

Этот addendum не закрывает общую Cabinet + Chat цель, backend/auth/payment/availability/persistence или owner visual acceptance. CSS guard `CSS-BLOAT.json` имеет matching baseline и `warning` с валидным source-backed justification; blind tuning остановлен до нового source defect/owner decision.

## Favorites height repair addendum — 2026-09-10

Отдельный bounded packet исправил высоты и внутренний вертикальный ритм карточек на `/nebula-account/favorites`. Для каждого breakpoint использованы mounted C76 frame owners из локального layer index: `1134:31446` / main `1134:31465` (1200), `1411:39781` / `1411:39815` (992), `1411:40248` / `1411:40282` (768), `1411:40982` / `1411:41016` (576), `1411:42394` / `1411:42428` (320). Whole-page fitting и screenshot-only inference не использовались.

В `favorite-page-v2/css/favorites.css` закреплены source board/content bounds и card heights `489/489/489/440/489px` для `1200/992/768/576/320`. Person header не сжимается; tags, facts, bio и action/rate rails остаются на одном относительном ритме между двумя текущими Yii projection cards, а promoted offer помещается внутри compact card. В `views/favorites/index.php` изменён только filter-close control: текстовый glyph заменён существующим source SVG; backend и дополнительные favorite records не затрагивались.

`artifacts/favorites-catalogue-20260910/CAPTURE.json` перегенерирован `2026-09-10T17:38:20.758Z`: 5/5 source geometry, 5/5 internal rhythm, 5/5 action rails, 0 overflow, HTTP 200, 0 assets/errors. Свежие PNG пяти ширин просмотрены против локальных C76 exports. Полный [READBACK](../../../artifacts/favorites-catalogue-20260910/READBACK.md) содержит metrics, changed owner и claim ceiling.

CSS guard [CSS-BLOAT.json](../../../artifacts/favorites-catalogue-20260910/CSS-BLOAT.json) показывает source-backed warning `+2563 B / +49 lines` относительно сохранённого preimage; justification валиден, blind tuning остановлен. Этот packet не закрывает backend favorite persistence, auth, availability/payment или owner visual acceptance; общий статус остаётся `pending_owner_visual_acceptance`.

## Favorites filter-close continuation addendum — 2026-09-10

До фикса кнопка была `40 × 40`, но `.fv-page button { font: inherit }` пересиливал размер `.fv-filter-close`, оставляя Unicode `×` с text box `7.81 × 22 px` (`16px`). По локальному C76 layer index source owner shared CLOSE Button — `1407:30663`, `39.59798 × 39.59798`; использован существующий `resources/images/top-up-to-start/close.svg` с установленным source-паттерном `rotate(-45deg)`.

После фикса semantic button и focus hooks сохранены: на `1200/992/768/576/320` кнопка остаётся `40 × 40`, transformed SVG bounds — `39.6 × 39.6`, `sourceCloseAsset=true`, request/runtime errors `0`. Before/after доказательства: `artifacts/favorites-catalogue-20260910/FILTER-CLOSE-BEFORE.json` и `FILTER-CLOSE-AFTER.json`; полный DOM/runtime readback — `artifacts/favorites-catalogue-20260910/READBACK.md`.

Это source-backed control repair, не backend simulation и не owner visual acceptance. Общая Nebula цель остаётся `pending_owner_visual_acceptance`; CSS warning требует прекращения дальнейшего blind tuning до нового source defect или решения владельца.

Общий strict implementation parser сохранён в `artifacts/favorites-catalogue-20260910/IMPLEMENTATION-COMPLIANCE.json` со статусом `fail_parser_boundary`/`production_code_ready=false`: его legacy Yii `img`-alt, AssetBundle и global-`html` сигналы не переименованы в PASS и не используются как доказательство runtime/Figma parity.

## Mia fresh runtime revalidation — 2026-09-10

`artifacts/mia-current-20260910/CURRENT.json` перегенерирован в `2026-09-10T19:12:50.203Z` на живом Yii-host: семь widths, HTTP 200, 0 console/page errors, `documentScrollWidth === viewport` во всех строках. Native PNG hashes обновлены и визуально просмотрены в `2026-09-10T19:19:37.0772424Z` против exact C76 exports; owner-review board остаётся актуальным. `FULL-REGIONS.json` от `2026-09-10T19:10:17.125Z` подтверждает 5/5 source-регионов и 7/7 review-card rows на `1200/992/768/576/320`, включая явный `coordinateOffsetY=80` для вложенных responsive frames (1200: `0`). `GEOMETRY-PARITY.json` (19:16:26Z) — 5/5, а `INTERACTION-SMOKE.json` (19:15:25Z) — 70/70 checks, 0 errors.

`proof/verify-mia-standalone.cjs` синхронизирован с текущими source SHA и даёт 12/12 source-only checks PASS. Официальный CSS guard даёт `warning`/`css_bloat_alarm_justified` при `+8436 B / +31.7944%` и валидном source-backed justification; дальнейший blind CSS tuning не продолжать без нового source packet или owner decision. `RUNTIME-VERIFICATION.json`, `READBACK.md` и `VISUAL-REVIEW-PACKET.json` синхронизированы; `pending_owner_visual_acceptance` сохранён.

## Mia current-runtime continuation addendum — 2026-09-11

После восстановления локального host выполнен новый чистый native capture `CURRENT.json` в `2026-09-10T23:13:08.491Z`: 7/7 маршрутов HTTP 200, 0 console/page errors и `documentScrollWidth === viewport` на `1200/992/1024/900/768/576/320`. Единичный предыдущий 404 не воспроизвёлся и не принят как продуктовый дефект.

Зависимые доказательства обновлены на этой фиксации: `FULL-REGIONS.json` `2026-09-10T23:15:39.221Z` — 5/5 source regions, 7/7 review cards на каждой целевой ширине, `coordinateOffsetY=0` для 1200 и `80` для вложенных responsive frames, все overflow/HTTP/error gates true; `INTERACTION-SMOKE.json` `2026-09-10T23:16:27.139Z` — 10 ширин и 70/70 checks PASS; `GEOMETRY-PARITY.json` `2026-09-10T23:37:18.05Z` — 5/5 supplemental rows PASS. Один промежуточный `ERR_NO_BUFFER_SPACE` на geometry 576px был внешним transient и чистым повтором не подтверждён.

Свежие current PNG пяти Figma-ширин просмотрены против exact local C76 exports в `2026-09-10T23:24:18.7889073Z`; human-visible geometry/paint/order defect не обнаружен. Mia/Margo identity и data deviation остаётся намеренной продуктовой проекцией. Source verifier даёт 12/12 PASS; на тот момент view/CSS SHA были `AAD8F9CF5648929F5461A3195725EEAA2227D383386E55FD6D0CC9C011791364` и `D10AFD9938621B73B8BAACA72C4DD87A5BEABBC3F0F881BFBFA517839468A76E`; post-copy locks указаны в последнем addendum.

Этот addendum обновляет только runtime/readback handoff; он не закрывает backend/auth/payment/availability/persistence и не является owner visual acceptance. `pageAcceptance` и общая Cabinet + Chat цель остаются `pending_owner_visual_acceptance`.

## Mia state-interaction continuation addendum — 2026-09-11

Для локального Mia demo-пути добавлен отдельный state adapter поверх существующих Busy/Offline overlay owners. Busy теперь ведёт в последовательность `unavailable → notification idle → pending → confirmed`; cancellation error не стирает подтверждённое намерение, повтор использует тот же request/idempotency contract. Тайм-аут переводит интерфейс в indeterminate с единственной affordance `Check status`, без дублирующей отправки. Offline для Mia ведёт в календарный consultation-flow `choose → review → pending → saved`; отмена с ошибкой сохраняет booking-confirmed и предлагает повтор. При смене эксперта pending операция abort/fence-ится, модальная поверхность закрывается.

Изменённое поведение остаётся явно локальным: `demo=true`, `persisted=false`, `backendRequired=false`, без notification/calendar persistence, billing или session mutation. В `expert-offline.js` inert fencing ограничено underlying `.c76-frame`; прежнее fencing всего chatroom root делало mounted offline action некликабельным.

`artifacts/nebula-mia-state-interactions-20260911/RESULT.json` даёт 5/5 ширин (`1200/992/768/576/320`), все Busy/Offline/pending/error/cancellation/expert-change checks PASS, overflow=false и pageErrors=0. `VISUAL-RESULT.json` содержит 30 отложенных после transition screenshots на `1200/576/320`; визуально проверены Busy, notification idle/confirmed/cancel-error, Offline и booking choose/review/indeterminate/saved. Это локальная UI-проверка, не backend proof и не owner visual acceptance.

CSS guard для этого continuation сохранён в `artifacts/nebula-mia-state-interactions-20260911/CSS-BLOAT-MIA.json` и `CSS-BLOAT-BOOKING.json`. Новый Mia-only stylesheet зафиксирован без придуманного preimage (`6412 B / 57 lines`, PASS); booking stylesheet показывает ожидаемый source-backed warning/alarm относительно точного `before-booking` preimage (`+5371 B / +50 lines`, justification valid). Blind CSS tuning после этого пакета не продолжать без нового source defect или owner decision.

## Psychic of the day C76 modern-card continuation — 2026-09-11

Отдельный bounded packet исправил mounted `Psychic of the day` на `/nebula-account/psychics`: старый peach/profile shell заменён source-backed C76 card owner с полной шириной карточки, сохранённым product-facing заголовком и существующими start-chat/favorite hooks. Figma source owners: `1413:35168 / card 1446:44280` (1200), `1414:35631 / card 1446:44755` (992), `1414:37323 / card 1451:44292` (768), `1441:44586 / card 1451:44586` (576), `1441:44889 / card 1451:44751` (320). Фон — точный локальный `psychic-card-background-c76.jpg`, SHA256 `438EFABFC045A242D4B910D0E53DF126BFBEB765482D851F6EFB2B96A3049533`.

Изменены только `views/psychics/index.php`, `resources/psychic-card-v3/css/psychics.css` и точная v3-копия background asset; добавлен воспроизводимый capture `artifacts/psychic-of-day-catalogue-20260911/capture-c76-modern.mjs`. На пяти целевых ширинах capture `CAPTURE.json` даёт 5/5 geometry (`1030×360`, `930×360`, `690×548`, `510×454`, `290×824`), 5/5 ожидаемых tag-вариантов (Psychology скрыта только в source 992/576), рабочие anchors Best Online route, profile/start-chat hooks, paint asset, click expansion и отсутствие horizontal overflow; runtime/page/request errors — `0`. PNG `psychic-day-{1200,992,768,576,320}.png` просмотрены: card остаётся full-width и modern C76 composition, без clipping.

Static/live proof: PHP lint, `node --check`, `git diff --check` — PASS; live page HTTP 200 (`135166` bytes), served v3 CSS HTTP 200 (`46537` bytes, modern C76 marker), copied background HTTP 200 (`326644` bytes), old `ps-feature__profile` absent. CSS bloat guard использует matching `psychics` baseline и валидный source-backed justification: `warning`, `+20014 B / +196 lines`, `css_bloat_alarm_justified`, `stop_blind_css_tuning=false`.

Этот addendum подтверждает frontend/source/runtime evidence только для mounted card. Он не подтверждает owner visual acceptance, backend/auth/payment/availability/persistence или реальную экспертную доступность; общая Cabinet + Chat цель остаётся `pending_owner_visual_acceptance`.

## Shared account-menu continuation — 2026-09-11

По запросу на расхождение dropdown между Chatroom и Notifications общий partial `views/partials/account-topbar.php` переведён на принятый Chatroom C76 visual owner: белая identity-first карточка Victoriya / Account navigation с пятью destination rows, source-backed иконками и тем же focus/hover treatment. Settings и Notifications явно подключают `settingsHeader=true`; остальные страницы с этим partial получают единый owner автоматически. Chatroom остаётся на отдельном C76 partial без debug fixture.

`artifacts/account-menu-shared-20260911/CAPTURE.json` даёт 15/15 rows PASS на `1200/992/768/576/320` для Chatroom, Settings и Notifications: menus open, Escape closes, first menuitem receives focus, 0 page/request errors. Свежие PNG сохранены рядом и просмотрены; live probes всех трёх маршрутов — HTTP 200, trigger/Account navigation present, legacy `Legal & Privacy` menu text absent. `CSS-BLOAT.json` — warning with valid source-backed justification (`+1249 B / +10 lines`, `source_comment_count=2`, `stop_blind_css_tuning=false`). Полный [READBACK](../../../artifacts/account-menu-shared-20260911/READBACK.md) фиксирует changed files, geometry и claim ceiling.

Дополнительный `SURFACE-PROBE.json` проверяет 21 маршрут, использующий общий partial: 21/21 HTTP 200, trigger/menu/identity/5 items присутствуют, assets 200, legacy menu в shared owner отсутствует.

Это frontend/runtime proof общего меню, не backend/auth/account-persistence/billing proof и не owner visual acceptance; общая Cabinet + Chat цель остаётся `pending_owner_visual_acceptance`.

## Notifications footer badge continuation — 2026-09-11

Индикатор оставлен во вторичном footer-shortcut авторизованной страницы Notifications; публичный footer и Chatroom не получили дублирующий badge. Основным входом остаётся bell в account menu. В `views/notifications/index.php` добавлен единый count contract: server-owned `account.notificationUnreadCount` при наличии, иначе явно отмеченный `preview-fixture`; визуальное отображение — точное `1–99`, `99+` для `100+`, скрытие при нуле и точный `aria-label`.

`resources/js/notifications-center.js` синхронно обновляет heading/footer badge, поддерживает singular/plural aria-label и принимает только server-authoritative `nebula:notification-unread-count` от live host; preview actions не объявляют persistence или receipt. `resources/css/notifications.css` закрепляет nowrap и явный hidden state.

Новый [CAPTURE](../../../artifacts/notifications-footer-badge-20260911/CAPTURE.json) даёт 7/7 брейкпоинтов (`1200/992/768/576/430/390/320`): initial `2`, после открытия `1`, после Mark all `0` с hidden badge, overflow `0`, runtime/request errors `0`. Полный [READBACK](../../../artifacts/notifications-footer-badge-20260911/READBACK.md) содержит source/runtime hashes и claim ceiling. Backend unread entity, read receipts, realtime и cross-device persistence по-прежнему не симулируются; owner visual acceptance остаётся открытой.

Официальный CSS guard `CSS-BLOAT.json` — warning с валидным source-backed justification относительно preimage (+10083 bytes / +35 lines; `stop_blind_css_tuning=false`); continuation изменяет только badge contract, без blind tuning.

## Mia current-runtime revalidation — 2026-09-11 (05:03–05:16 UTC)

После последних source-backed изменений shared expert-card action выполнена свежая native-проверка живого Yii host для `/nebula-account/psychics/mia-jacomo`. `CURRENT.json` от `2026-09-11T05:03:22.387Z` даёт 7/7 widths (`1200/992/1024/900/768/576/320`), HTTP 200, 0 console/page errors и `documentScrollWidth === viewport` во всех строках. `FULL-REGIONS.json` от `2026-09-11T05:04:24.181Z` подтверждает 5/5 source regions и 7/7 review-card rows на каждой целевой ширине; все source/overflow/HTTP/error gates PASS.

`INTERACTION-SMOKE.json` от `2026-09-11T05:07:22.745Z` проверяет 10 widths и 70/70 checks PASS (HTTP 200, failed responses 0, console/page errors 0), включая Mia Busy → shared `Notify me when expert is available` flow и сохранённую legacy booking ветку для offline fixtures. `GEOMETRY-PARITY.json` от `2026-09-11T05:10:54.505Z` — supplemental 5/5 rows PASS; `BOUNDARY.json` от `2026-09-11T05:11:42.512Z` — 9/9 seam widths PASS, stats-fit 9/9, overflow 0, HTTP/console/page errors 0. Эти проверки доказывают текущий local runtime и interaction/geometry contracts, но не backend, auth, payment, availability, transport или persistence.

Актуальные source locks: `views/psychics/view.php` SHA256 `F7EB8E5E31E946178E4DD56DE2D1CB6E667C0698AC1C3CC4AD0278C6DD9D2648`; `resources/psychic-card-v2/css/psychics.css` SHA256 `10A95C27A4A801BDF1C9AC9703BEB1CEDD3D067F19A5D6536BCDD7447BCEF3EB`. `proof/verify-mia-standalone.cjs` и `STANDALONE-SOURCE-VERIFICATION.json` синхронизированы и дают 12/12 source-only checks PASS (актуальный source artifact SHA256 `5792CB1F08B5B8587A5C8E224BFE3203C27314B920C68EFFAAB74D524DC0B7A2`).

Свежие current PNG пяти целевых ширин повторно просмотрены 2026-09-11T05:35:09.709Z против точных локальных C76 exports: `current-1200.png` `9665E553…D29B46BA`, `current-992.png` `9FBD8705…DA2347D5`, `current-768.png` `00DFCC33…6AD6447B`, `current-576.png` `302E4DC4…FE15475`, `current-320.png` `86D01AFB…E188C53`. Human-visible geometry/paint/order defect после shared action asset не обнаружен. `COMPARE-BOARD.html` и `VISUAL-REVIEW-PACKET.json` остаются review surface; `pageAcceptance=pending_owner_visual_acceptance`, общая Cabinet + Chat цель не закрыта.

## Mia current capture classifier and revalidation — 2026-09-11 (05:46–05:52 UTC)

После read-only диагностики location `http://127.0.0.1:8173/favicon.ico` подтверждён как единственный необязательный preview-host 404. Capture scripts теперь отделяют этот известный warning в `knownWarnings`; реальные console/page errors остаются в fatal `errors` и не фильтруются. Новый `CURRENT.json` от `2026-09-11T05:46:44.803Z` даёт 7/7 widths HTTP 200, 0 product errors, 0 document overflow; на строке 992 сохранён только один `knownWarnings` favicon entry.

Зависимые проверки повторены на том же source: `GEOMETRY-PARITY.json` от `2026-09-11T05:49:36.831Z` — 5/5; `BOUNDARY.json` от `2026-09-11T05:50:33.538Z` — 9/9 seam rows; `FULL-REGIONS.json` от `2026-09-11T05:51:52.900Z` — 5/5 regions и 7/7 review rows на ширину; `INTERACTION-SMOKE.json` от `2026-09-11T05:51:58.416Z` — 70/70 checks. Все HTTP/overflow/error gates PASS, backend/auth/payment/availability/persistence не симулировались.

После перегенерации `current-992.png` получил SHA256 `B865BE0D1B32294BDAD8D23DBDA36A774B144C32BC54701970D7D22354E8B8FC`; кадр spot-checked против exact C76 export и не выявил human-visible geometry/paint/order defect. Остальные целевые PNG сохранили прежние SHA. На момент этого исторического capture source lock был view `3F18CD2F…57BB4DB`; post-copy view lock обновлён ниже. Owner visual acceptance и общая Cabinet + Chat цель остаются открытыми.

## Mia independent visual re-inspection — 2026-09-11 06:05 UTC

Все пять актуальных native PNG (`1200/992/768/576/320`) повторно просмотрены рядом с exact local C76 exports в `2026-09-11T06:05:37.7825156Z`; human-visible geometry/paint/breakpoint-order defect не обнаружен. Это обновляет только агентское visual observation. `pending_owner_visual_acceptance` сохраняется; Mia/Margo content deviation, backend/auth/payment/availability/persistence limits не изменены.

`FULL-REGIONS.json` на этом же source дополнительно сопоставляет 48 source-box координат/размеров для каждого breakpoint; все 5/5 строк и review-card rows PASS, максимальное отклонение — `0.484375px` субпиксельного browser rounding. Это geometry proof, а не owner acceptance.

## Mia post-copy visual refresh — 2026-09-12

По запросу на короткую подпись Busy-карточки карточный CTA унифицирован как `Notify me`; Offline `Book session` и Online `Start chat` сохранены, а модальное окно сохраняет полную поясняющую фразу `Notify me when expert is available`. Изменены только Mia-facing source/host copy surfaces и fixture: `PsychicSourceFixtures.php`, `views/psychics/index.php`, `views/favorites/index.php`, `views/partials/psychic-card.php`, `views/psychics/view.php`, `resources/js/expert-card-actions.js` и точная host-копия action asset. Backend/persistence/availability/auth не добавлялись и не симулировались.

После изменения выполнен свежий native runtime capture на живом локальном Yii host: `artifacts/mia-current-20260910/CURRENT.json` от `2026-09-12T01:45:19.038Z` — 7/7 HTTP 200, 0 product console/page errors и `documentScrollWidth === viewport`; `FULL-REGIONS.json` от `2026-09-12T01:43:36.027Z` — 5/5 source regions и 35/35 review-card rows; `BOUNDARY.json` — 9/9 seam rows; `GEOMETRY-PARITY.json` — 5/5; `INTERACTION-SMOKE.json` — 70/70. Визуально все пять current/source пар (`1200/992/768/576/320`) просмотрены в `2026-09-12T01:46:51.7349716Z`; human-visible geometry/paint/order defect не обнаружен, CTA помещается на всех брейкпоинтах.

Актуальный source view SHA теперь `F7EB8E5E31E946178E4DD56DE2D1CB6E667C0698AC1C3CC4AD0278C6DD9D2648`; CSS без изменений — `10A95C27A4A801BDF1C9AC9703BEB1CEDD3D067F19A5D6536BCDD7447BCEF3EB`; source-only verifier синхронизирован и даёт 12/12 PASS. Обновлены `READBACK.md`, `RUNTIME-VERIFICATION.json`, `VISUAL-REVIEW-PACKET.json` и compare board; exact C76 exports не изменялись. Дополнительные post-copy seam PNG `current-991.png`/`current-575.png` пересняты и просмотрены в `2026-09-12T02:01:46.3420363Z`.

Это post-copy frontend/runtime evidence и вспомогательная визуальная поверхность для owner review. `pageAcceptance` остаётся `pending_owner_visual_acceptance`; Mia/Margo identity/data deviation, CSS warning и общая Cabinet + Chat цель не закрыты.

## Mia internal hero rail parity addendum — 2026-09-12

Чтобы проверить внутреннюю геометрию hero после copy-only refresh, выполнен отдельный capture `artifacts/mia-current-20260910/HERO-INTERNAL-PARITY.json` в `2026-09-12T02:42:56.605Z` на пяти source widths `1200/992/768/576/320`. Для каждой строки использованы exact C76 owners карточки, Top, portrait, body, side, offer, CTA и specialty rows; текущий DOM сопоставлен с source-sized rails. Итог: `5/5` строк PASS, `allHeroRails=true`, `allHeroBodyRails=true`, `allSpecialtyRows=true`, `allBusyLabelFit=true`, HTTP `200`, `allNoErrors=true`, `allNoOverflow=true`, `backendSimulated=false`. Видимые chip counts `7/6/7/6/7` соответствуют source breakpoint pattern.

Проверка является supplemental DOM geometry/state evidence и не заменяет просмотр current/source PNG или явную owner visual acceptance. Backend, auth, availability, notification persistence, booking и Cabinet + Chat readiness по-прежнему не подтверждены; `pageAcceptance=pending_owner_visual_acceptance` сохраняется. Production CSS не изменялся.

## Mia dynamic paint/assets parity addendum — 2026-09-12

После внутренних hero rails выполнен динамический capture `artifacts/mia-current-20260910/PAINT-ASSETS-PARITY.json` в `2026-09-12T03:00:29.900Z` на `1200/992/768/576/320`. Все `5/5` строк PASS: source-commented computed paints совпадают для hero glass/overlay (`0.3` paint opacity, `5.15px` blur), CTA `#673eda`, offer/About/expertise и banner layers; exact C76 asset URLs и served-byte SHA совпадают в `30/30` asset rows, desktop/mobile stats корректно переключаются, images loaded, HTTP 200, product errors и document overflow — `0`.

Это runtime paint/asset evidence, не статический вывод и не owner visual acceptance. Exact source export по-прежнему содержит Margo, текущая product projection — Mia; backend/auth/payment/availability/notification persistence/booking не симулировались. `pageAcceptance` и общая Cabinet + Chat цель остаются `pending_owner_visual_acceptance`; blind CSS tuning остановлен по CSS guard.

## Caster / Anton bounded review route — 2026-09-12

Подготовлен отдельный artifact-first packet для зарегистрированного маршрута `caster_anton_visual_product_acceptance_route`: [CASTER-ANTON-REVIEW-PACKET.json](../../../artifacts/mia-current-20260910/CASTER-ANTON-REVIEW-PACKET.json). Раздельные receipts: [CASTER-RECEIPT.json](../../../artifacts/mia-current-20260910/CASTER-RECEIPT.json) (`pass_with_limits` для source-aligned visual candidate, `expert_visual_proxy_only`) и [ANTON-RECEIPT.json](../../../artifacts/mia-current-20260910/ANTON-RECEIPT.json) (`conditional_local_rendered_candidate`).

Caster не обнаружил source-backed visual repair на `1200/992/768/576/320`; Anton подтвердил честность Busy/Offline/Online labels и потребовал сохранить owner/backend boundary. Внешний независимый execution surface не вызывался и не имитировался: route допускает artifact-first local review, а финальная acceptance остаётся у Nebula owner. Не закрыты owner visual acceptance, availability/notification/booking/chat destination и persistence; `backendSimulated=false`, CSS guard остаётся source-backed warning, blind tuning остановлен.

## Figma MCP freshness audit — 2026-09-12

Канонический C76 file key и exact-node read-only контур дополнительно проверены через Figma MCP. Для `1200 / 1095:28955` remote design context получен и совпал с локальным C76 context fingerprint: `Psychic CARD 1200`, фон `1200×5211`, hero card `1030×360`, banner tops `2065/5766`. После этого Starter-plan лимит Figma MCP заблокировал вызовы для `992 / 768 / 576 / 320`; обход через новую сессию, cookies или Figma write не выполнялся. Разрешённый локальный export-service `127.0.0.1:47831` также ответил `connection refused` на `/`, `/health`, `/api/health`, `/status`.

Подробный [FIGMA-MCP-FRESHNESS-RECEIPT.json](../../../artifacts/mia-current-20260910/FIGMA-MCP-FRESHNESS-RECEIPT.json) фиксирует этот предел: текущий пятиширинный board по-прежнему использует hash-bound exports того же C76 file key, но fresh remote revision подтверждён только для 1200. Это не меняет визуальный runtime evidence и не закрывает owner visual acceptance; перед финальным closeout недостающие четыре exact-node refresh должны быть выполнены через авторизованный Figma/Manhattan route.

Повторный read-only запрос exact-node `1415:44362` для 992px `2026-09-12T04:29:51.3157870Z` снова получил официальный Starter-plan rate limit. Обход сессии/cookie, Figma write и продуктовые изменения не выполнялись; актуальная граница записана в `FIGMA-MCP-FRESHNESS-RECEIPT.json`. 

Повторная bounded-проверка exact-node `1415:44362` `2026-09-12T04:51:22.1713530Z` снова получила официальный Starter-plan rate limit. Новых сессий, cookie-transfer, Figma write и продуктовых изменений не выполнялось; четыре не-1200 ширины остаются hash-bound local C76 fallback.

Ещё одна bounded-проверка exact-node `1415:44362` `2026-09-12T05:15:51.6723050Z` снова получила официальный Starter-plan rate limit. Новых сессий, cookie-transfer, Figma write и продуктовых изменений не выполнялось; remote freshness остаётся `1/5`.

Свежая bounded-проверка exact-node `1415:44362` `2026-09-12T05:26:52.8138851Z` снова получила официальный Starter-plan rate limit. Новых сессий, cookie-transfer, Figma write и продуктовых изменений не выполнялось; remote freshness остаётся `1/5`. Это повторяет источник-блокер, но не расширяет claim ceiling и не заменяет owner visual acceptance.

Свежий native runtime capture `CURRENT.json` завершён `2026-09-12T04:59:55.705Z`: все 7 ширин вернули HTTP 200, product errors `0`, `documentScrollWidth === viewport`; 1200px current PNG получил новый SHA `886BFB77CDD239F02F47965CC9605F25EFBD4EC26D21DE7024B5B8AA8D0B3508`. Пара `1200/source` повторно просмотрена `2026-09-12T05:01:31.4409268Z`; нового geometry/paint/order дефекта не обнаружено. Owner visual acceptance и backend boundary без изменений.

## Mia native runtime recheck — 2026-09-12 04:17 UTC

Read-only probe подтвердил, что локальный PHP Yii host снова отвечает штатно: `/` и `/nebula-account/psychics/mia-jacomo` возвращают HTTP 200; проба `/nebula-account/psychics/view?id=7` дала штатный 404 из-за отсутствующего slug и не является продуктовым дефектом. Повторный native capture `artifacts/mia-current-20260910/CURRENT.json` завершён `2026-09-12T04:17:32.876Z`: 7/7 HTTP 200, 0 product errors и `documentScrollWidth === viewport` на всех widths. Current/source PNG пяти целевых widths повторно просмотрены `2026-09-12T04:20:43.1308647Z`; human-visible geometry/paint/order defect не найден. Новые current hashes привязаны в `VISUAL-REVIEW-PACKET.json`; owner visual acceptance остаётся `pending_owner_visual_acceptance`, backend/auth/payment/availability/notification persistence/booking не подтверждались.
