# Чего не хватает в комплекте Nebula

Проверено 16 сентября 2026. Исходный пакет: `D:\Codex\The First Project\nebula-codex`.

## Краткий итог

В `nebula-static` выделена 71 страница/состояние: 60 страниц кабинета и 11 публичных страниц. Это чистые HTML и браузерные ресурсы. Yii2, PHP, Composer, серверные модули, отчёты и сборочные инструменты в комплект не включены.

Полный сайт пока не собран: отсутствуют исходники пяти страниц входа/регистрации/меню и часть ресурсов главной и четырёх лендингов. Неполные пять страниц сохранены для просмотра и восстановления в `nebula-static-incomplete`; они не прошли приёмку и не входят в основной комплект.

## 1. Страницы, для которых нет исходного HTML

| Страница | Ожидаемый исходник | Что ещё требуется |
|---|---|---|
| Вход | `_unzipped/login.html` | `auth-login.css` и используемые изображения |
| Регистрация, шаг 1 | `_unzipped/signup-step-1.html` | `figma-auth.css` и используемые изображения |
| Регистрация, шаг 2 | `_unzipped/signup-step-2.html` | `figma-auth.css` и используемые изображения |
| Меню | `_unzipped/menu-new.html` | `menu-new.css`, изображения и исходное подключение шрифтов |
| Открытое меню | `_unzipped/menu-open-new.html` | `menu-open-new.css`, изображения и исходное подключение шрифтов |

Эти ожидания подтверждены конфигурацией исходного пакета. Похожие модальные окна кабинета не заменяют отсутствующие публичные страницы.

## 2. Главная и четыре лендинга с неполными ресурсами

Счётчик ниже — число уникальных неразрешённых путей внутри каждой страницы и её CSS, без параметров версии. Одинаковый файл может требоваться нескольким страницам. Это точные ссылки из переданных файлов, а не предположение по внешнему виду.

| Страница | Неразрешённых путей | Последствие |
|---|---:|---|
| Главная | 27 | Нельзя подтвердить исходное оформление и полноту изображений |
| Cheap Psychic | 48 | Нельзя подтвердить исходное оформление и полноту изображений |
| Tarot Reading | 13 | Нельзя подтвердить исходное оформление и полноту изображений |
| Taurus Compatibility | 34 | Нельзя подтвердить исходное оформление и полноту изображений |
| Zodiac Compatibility | 63 | Нельзя подтвердить исходное оформление и полноту изображений |

У главной отсутствуют в том числе `home-reverse-type-owner.css` и `home-reverse-shell-owner.css`. У четырёх лендингов есть HTML и часть CSS/JS, но отсутствуют указанные ниже дополнительные стили, изображения или скрипты. Ресурсы с именами Figma-экспортов нельзя достоверно заменить похожими картинками с действующего сайта.

### Главная

| Ресурс | Результат поиска |
|---|---|
| `home-reverse-type-owner.css` | не найден в SOURCE |
| `home-reverse-shell-owner.css` | не найден в SOURCE |
| `img/hero-rel.png` | не найден в SOURCE |
| `img/hero-self.png` | не найден в SOURCE |
| `img/hero-soul.png` | не найден в SOURCE |
| `img/hero-ex.png` | не найден в SOURCE |
| `img/psy-4.png` | не найден в SOURCE |
| `img/psy-5.png` | не найден в SOURCE |
| `img/clients-video-1.png` | не найден в SOURCE |
| `img/clients-video-2.png` | не найден в SOURCE |
| `img/clients-video-3.png` | не найден в SOURCE |
| `img/clients-video-4.png` | не найден в SOURCE |
| `img/best-reading_d.png` | не найден в SOURCE |
| `img/best-reading_m.png` | не найден в SOURCE |
| `img/topics-offer-1.png` | не найден в SOURCE |
| `img/topics-offer-2.png` | не найден в SOURCE |
| `img/topics-offer-3.png` | не найден в SOURCE |
| `img/topic-1.png` | не найден в SOURCE |
| `img/topic-2.png` | не найден в SOURCE |
| `img/topic-3.png` | не найден в SOURCE |
| `img/topic-4.png` | не найден в SOURCE |
| `img/topic-5.png` | не найден в SOURCE |
| `img/topic-6.png` | не найден в SOURCE |
| `img/video-cover-figma.png` | не найден в SOURCE |
| `img/situation_d.png` | не найден в SOURCE |
| `img/situation_m.png` | не найден в SOURCE |
| `jquery.js` | есть одноимённые файлы; точная зависимость не установлена |

### Cheap Psychic

| Ресурс | Результат поиска |
|---|---|
| `auth-fonts.css` | не найден в SOURCE |
| `cheap-psychic.css` | не найден в SOURCE |
| `cheap-psychic-detail.css` | не найден в SOURCE |
| `cheap-psychic-responsive.css` | не найден в SOURCE |
| `cheap-psychic-source-locks.css` | не найден в SOURCE |
| `/_unzipped/img/cheap-psychic-theme-917-17383.webp` | не найден в SOURCE |
| `/_unzipped/img/cheap-psychic-theme-917-17383.png` | не найден в SOURCE |
| `img/cheap-source-ba117009198a6b9ea14f8a651efb1fe68c4f5f77.webp` | не найден в SOURCE |
| `img/cheap-source-ba117009198a6b9ea14f8a651efb1fe68c4f5f77.png` | не найден в SOURCE |
| `img/cheap-source-5f29048819d5f90bcf19322317631591812ddd0c.webp` | не найден в SOURCE |
| `img/cheap-source-5f29048819d5f90bcf19322317631591812ddd0c.png` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17390-avatar.webp` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17390-avatar.jpeg` | не найден в SOURCE |
| `img/cheap-cp01-figma-star-81-511.svg` | не найден в SOURCE |
| `img/cheap-cp01-figma-chat-587-7830.svg` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17391-avatar.webp` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17391-avatar.png` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17392-avatar.webp` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17392-avatar.jpeg` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17394-avatar.webp` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17394-avatar.jpeg` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17395-avatar.webp` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17395-avatar.jpeg` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17396-avatar.webp` | не найден в SOURCE |
| `img/cheap-figma-expert-917-17396-avatar.jpeg` | не найден в SOURCE |
| `img/cheap-source-e416fd5b4d6e5e23aae7bb4910e320946cfd2c7b.webp` | не найден в SOURCE |
| `img/cheap-source-e416fd5b4d6e5e23aae7bb4910e320946cfd2c7b.png` | не найден в SOURCE |
| `img/cheap-source-d604d23c273591c9dbcca8480588e4f0ed7ccd92.webp` | не найден в SOURCE |
| `img/cheap-source-d604d23c273591c9dbcca8480588e4f0ed7ccd92.png` | не найден в SOURCE |
| `img/cheap-source-497245a54adeb82fd007b2228c3f83e580d2e86f.webp` | не найден в SOURCE |
| `img/cheap-source-497245a54adeb82fd007b2228c3f83e580d2e86f.png` | не найден в SOURCE |
| `img/cheap-source-a2a1c540d6d0aa22158c678d5165ba19adb4f8bc.webp` | не найден в SOURCE |
| `img/cheap-source-a2a1c540d6d0aa22158c678d5165ba19adb4f8bc.png` | не найден в SOURCE |
| `img/cheap-source-e69cad437feaca40393e2cbc7737dc3a9574d520.webp` | не найден в SOURCE |
| `img/cheap-source-e69cad437feaca40393e2cbc7737dc3a9574d520.png` | не найден в SOURCE |
| `img/cheap-source-15f11c19299add4a06ac5d51c825e1dd6fd588c9.webp` | не найден в SOURCE |
| `img/cheap-source-15f11c19299add4a06ac5d51c825e1dd6fd588c9.png` | не найден в SOURCE |
| `img/cheap-source-7a6e7fc347bba22dfda3d597bdc1dad9ffb24246.webp` | не найден в SOURCE |
| `img/cheap-source-7a6e7fc347bba22dfda3d597bdc1dad9ffb24246.png` | не найден в SOURCE |
| `img/cheap-source-7c7c0ef07d004c3a6f1392b6a2976fb23a246ddd.webp` | не найден в SOURCE |
| `img/cheap-source-7c7c0ef07d004c3a6f1392b6a2976fb23a246ddd.png` | не найден в SOURCE |
| `img/cheap-source-2c8080a6dc885dd6e57e88b951d33f7fbd574b64.webp` | не найден в SOURCE |
| `img/cheap-source-2c8080a6dc885dd6e57e88b951d33f7fbd574b64.png` | не найден в SOURCE |
| `img/cheap-source-08074b8199d65e702c64fbe2751aeb9fbaed5ced.webp` | не найден в SOURCE |
| `img/cheap-source-08074b8199d65e702c64fbe2751aeb9fbaed5ced.png` | не найден в SOURCE |
| `img/cheap-source-0825c8379b08cc3e336c26c1c7df3b43112c2ea7.webp` | не найден в SOURCE |
| `img/cheap-source-0825c8379b08cc3e336c26c1c7df3b43112c2ea7.png` | не найден в SOURCE |
| `jquery.js` | есть одноимённые файлы; точная зависимость не установлена |

### Tarot Reading

| Ресурс | Результат поиска |
|---|---|
| `auth-fonts.css` | не найден в SOURCE |
| `tarot-reading.owner.00.css` | не найден в SOURCE |
| `tarot-reading.owner.01.css` | не найден в SOURCE |
| `tarot-reading.owner.02.css` | не найден в SOURCE |
| `tarot-reading.owner.03.css` | не найден в SOURCE |
| `img/tarot-hero-art-1200-figma.webp` | не найден в SOURCE |
| `img/tarot-hero-art-1200-figma.png` | не найден в SOURCE |
| `img/tarot-rely-art-1200-figma.webp` | не найден в SOURCE |
| `img/tarot-rely-art-1200-figma.png` | не найден в SOURCE |
| `img/tarot-reach-art-1200-figma.webp` | не найден в SOURCE |
| `img/tarot-reach-art-1200-figma.png` | не найден в SOURCE |
| `jquery.js` | есть одноимённые файлы; точная зависимость не установлена |
| `tarot-reading.js` | не найден в SOURCE |

### Taurus Compatibility

| Ресурс | Результат поиска |
|---|---|
| `artifacts/nebula-easy-taurus-compatibility/source-assets/hero-ellipse-1200.svg` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-992-node-983-26867-paint.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-768-node-986-33308-paint.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-576-node-988-24215-paint.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-320-node-990-23222-paint.webp` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/video-section-bg.png` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/video-bg.png` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/video-character.png` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/video-mobile-play.svg` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/sign-card-bg-320.svg` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/video-mobile-bg.png` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/video-mobile-character.png` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/person.svg` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/hero-taurus-1200.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-01-aries.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-02-taurus.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-03-gemini.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-04-cancer.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-05-leo.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-06-virgo.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-07-libra.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-08-scorpio.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-09-sagittarius.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-10-capricorn.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-11-aquarius.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-12-pisces.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-banner-320-figma.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-banner-576-figma.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-banner-768-figma.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-banner-992-figma.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-banner-1200-figma.webp` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/taurus-woman-compatibility.png` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/taurus-man-compatibility.png` | не найден в SOURCE |
| `artifacts/nebula-easy-taurus-compatibility/source-assets/sex-compatibility.png` | не найден в SOURCE |

### Zodiac Compatibility

| Ресурс | Результат поиска |
|---|---|
| `auth-fonts.css` | не найден в SOURCE |
| `zodiac-compatibility-new.owner.00.css` | не найден в SOURCE |
| `zodiac-compatibility-new.owner.01.css` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-01-aries.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-01-aries.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-02-taurus.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-02-taurus.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-03-gemini.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-03-gemini.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-04-cancer.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-04-cancer.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-05-leo.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-05-leo.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-06-virgo.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-06-virgo.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-07-libra.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-07-libra.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-08-scorpio.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-08-scorpio.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-09-sagittarius.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-09-sagittarius.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-10-capricorn.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-10-capricorn.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-11-aquarius.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-11-aquarius.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-12-pisces.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-sign-12-pisces.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-banner-texture-1.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-banner-texture-1.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-banner-texture-2.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-banner-texture-2.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-chart-content-1200-node-621-8434.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-chart-content-1200-node-621-8434.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-chart-table-1200-figma.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-chart-table-1200-figma.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-element-fire.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-element-fire.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-element-water.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-element-water.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-element-earth.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-element-earth.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-element-air.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-element-air.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-992-node-983-26867-paint.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-992-node-983-26867-paint.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-768-node-986-33308-paint.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-768-node-986-33308-paint.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-576-node-988-24215-paint.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-576-node-988-24215-paint.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-320-node-990-23222-paint.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-bg-320-node-990-23222-paint.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-img-320-figma-cutout.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-hero-img-320-figma-cutout.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-chart-table-992-figma.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-chart-table-992-figma.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-chart-table-768-figma.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-chart-table-768-figma.png` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-chart-table-576-figma.webp` | не найден в SOURCE |
| `_unzipped/img/zodiac-compat-chart-table-576-figma.png` | не найден в SOURCE |
| `zodiac-compatibility-new.owner.03.css` | не найден в SOURCE |
| `zodiac-compatibility-new.owner.04.css` | не найден в SOURCE |
| `zodiac-compatibility-new.owner.05.css` | не найден в SOURCE |
| `jquery.js` | есть одноимённые файлы; точная зависимость не установлена |

## 3. Ссылки на отсутствующие или неполные страницы

В основном комплекте сохранены содержательные ссылки с относительными HTML-адресами. Они не подменены заглушками или чужими страницами. Следующие назначения пока не существуют в основном каталоге:

| Назначение | Страниц, которые ссылаются на него |
|---|---:|
| `about-us.html` | 11 |
| `advisor-chat.html` | 1 |
| `birth-chart.html` | 11 |
| `careers-join.html` | 11 |
| `contact-us.html` | 11 |
| `index.html#reviews` | 8 |
| `index.html#why-trust` | 7 |
| `index.html` | 11 |
| `live-chat-rules.html` | 11 |
| `payment-terms.html` | 11 |
| `press.html` | 3 |
| `refund-policy.html` | 11 |
| `reviews.html` | 3 |
| `signup-step-1.html` | 11 |
| `support.html` | 3 |
| `terms-conditions.html` | 11 |
| `topic.html` | 11 |
| `trust.html` | 3 |
| `zodiac-compatibility.html` | 11 |

Перечень отражает навигацию исходной вёрстки. Страницы, упомянутые только в ссылках, требуют исходного экспорта либо отдельного решения об объёме проекта. Например, ссылки на условия, поддержку и регистрацию не доказывают наличие готовых макетов этих страниц.

## 4. Что нужно передать для завершения

1. Полный исходный HTML/CSS/JS экспорт входа, двух шагов регистрации и двух вариантов меню.
2. Папки ресурсов главной, Cheap Psychic, Tarot Reading, Taurus Compatibility и Zodiac Compatibility с сохранёнными относительными путями: `img`, `_unzipped`, `assets`, а также CSS/JS из списка выше.
3. Исходники остальных страниц из навигации, если они входят в согласованный объём.
4. Ссылку на актуальную Figma с доступом или полный экспорт эталонных экранов, чтобы отдельно подтвердить точное визуальное совпадение. Текущая проверка сравнивала поведение и структуру с переданной вёрсткой; pixel-perfect соответствие актуальной Figma не подтверждено.

Главная также ссылается на Google Fonts и Swiper CDN. В основном комплекте внешних ресурсов нет; для завершения главной потребуется согласовать версии и добавить локальные копии этих зависимостей.

## 5. Что не является недостающей вёрсткой

Серверная авторизация, отправка сообщений, платежи, сохранение данных и API не входят в комплект чистой вёрстки. Существующие демонстрационные состояния интерфейса сохранены, но не считаются реализацией серверных функций. Рабочий домен для canonical/social metadata задаётся при интеграции; адрес localhost не должен становиться адресом опубликованной страницы.

Машиночитаемая детализация с исходными путями и совпадающими именами файлов: [missing-resources.json](missing-resources.json).