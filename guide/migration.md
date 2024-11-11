# Міграція з v5

## API середовища

У рамках нової експериментальної [API середовища](/guide/api-environment.md) було проведено велике внутрішнє рефакторинг. Vite 6 прагне уникати змін, що ламають сумісність, щоб більшість проектів могли швидко оновитися до нової основної версії. Ми почекаємо, поки значна частина екосистеми перейде на нову версію, щоб стабілізувати її та почати рекомендувати використання нових API. Можуть бути деякі крайні випадки, але вони повинні впливати лише на низькорівневе використання фреймворками та інструментами. Ми працювали з підтримувачами в екосистемі, щоб пом'якшити ці відмінності до випуску. Будь ласка, [відкрийте проблему](https://github.com/vitejs/vite/issues/new?assignees=&labels=pending+triage&projects=&template=bug_report.yml), якщо ви помітите регресію.

Деякі внутрішні API були видалені через зміни в реалізації Vite. Якщо ви покладалися на один з них, будь ласка, створіть [запит на функцію](https://github.com/vitejs/vite/issues/new?assignees=&labels=enhancement%3A+pending+triage&projects=&template=feature_request.yml).

## API виконання Vite

Експериментальний API виконання Vite еволюціонував у API запуску модулів, випущений у Vite 6 як частина нової експериментальної [API середовища](/guide/api-environment). Оскільки ця функція була експериментальною, видалення попереднього API, введеного у Vite 5.1, не є зміною, що ламає сумісність, але користувачам потрібно оновити своє використання до еквіваленту запуску модулів у рамках міграції на Vite 6.

## Загальні зміни

### Значення за замовчуванням для `resolve.conditions`

Ця зміна не впливає на користувачів, які не налаштовували [`resolve.conditions`](/config/shared-options#resolve-conditions) / [`ssr.resolve.conditions`](/config/ssr-options#ssr-resolve-conditions) / [`ssr.resolve.externalConditions`](/config/ssr-options#ssr-resolve-externalconditions).

У Vite 5 значення за замовчуванням для `resolve.conditions` було `[]`, і деякі умови додавалися внутрішньо. Значення за замовчуванням для `ssr.resolve.conditions` було значенням `resolve.conditions`.

З Vite 6 деякі умови більше не додаються внутрішньо і повинні бути включені в значення конфігурації.
Умови, які більше не додаються внутрішньо для

- `resolve.conditions` це `['module', 'browser', 'development|production']`
- `ssr.resolve.conditions` це `['module', 'node', 'development|production']`

Значення за замовчуванням для цих опцій оновлені до відповідних значень, і `ssr.resolve.conditions` більше не використовує `resolve.conditions` як значення за замовчуванням. Зверніть увагу, що `development|production` є спеціальною змінною, яка замінюється на `production` або `development` залежно від значення `process.env.NODE_ENV`.

Якщо ви вказали власне значення для `resolve.conditions` або `ssr.resolve.conditions`, вам потрібно оновити його, щоб включити нові умови.
Наприклад, якщо ви раніше вказували `['custom']` для `resolve.conditions`, вам потрібно вказати `['custom', 'module', 'browser', 'development|production']` замість цього.

### JSON stringify

У Vite 5, коли [`json.stringify: true`](/config/shared-options#json-stringify) встановлено, [`json.namedExports`](/config/shared-options#json-namedexports) було вимкнено.

З Vite 6, навіть коли `json.stringify: true` встановлено, `json.namedExports` не вимикається і значення враховується. Якщо ви хочете досягти попередньої поведінки, ви можете встановити `json.namedExports: false`.

Vite 6 також вводить нове значення за замовчуванням для `json.stringify`, яке є `'auto'`, що буде серіалізувати лише великі JSON файли. Щоб вимкнути цю поведінку, встановіть `json.stringify: false`.

### Розширена підтримка посилань на активи в HTML елементах

У Vite 5 лише кілька підтримуваних HTML елементів могли посилатися на активи, які будуть оброблені та зібрані Vite, такі як `<link href>`, `<img src>` тощо.

Vite 6 розширює підтримку ще більше HTML елементів. Повний список можна знайти в документації [HTML features](/guide/features.html#html).

Щоб відмовитися від обробки HTML на певних елементах, ви можете додати атрибут `vite-ignore` на елемент.

### postcss-load-config

[`postcss-load-config`](https://npmjs.com/package/postcss-load-config) було оновлено до v6 з v4. [`tsx`](https://www.npmjs.com/package/tsx) або [`jiti`](https://www.npmjs.com/package/jiti) тепер потрібні для завантаження TypeScript postcss конфігураційних файлів замість [`ts-node`](https://www.npmjs.com/package/ts-node). Також [`yaml`](https://www.npmjs.com/package/yaml) тепер потрібен для завантаження YAML postcss конфігураційних файлів.

### Sass тепер використовує сучасний API за замовчуванням

У Vite 5 за замовчуванням використовувався застарілий API для Sass. Vite 5.4 додав підтримку сучасного API.

З Vite 6 сучасний API використовується за замовчуванням для Sass. Якщо ви все ще хочете використовувати застарілий API, ви можете встановити [`css.preprocessorOptions.sass.api: 'legacy'` / `css.preprocessorOptions.scss.api: 'legacy'`](/config/shared-options#css-preprocessoroptions). Але зверніть увагу, що підтримка застарілого API буде видалена у Vite 7.

Щоб перейти на сучасний API, дивіться [документацію Sass](https://sass-lang.com/documentation/breaking-changes/legacy-js-api/).

### Налаштування імені вихідного файлу CSS в режимі бібліотеки

У Vite 5 ім'я вихідного файлу CSS в режимі бібліотеки завжди було `style.css` і не могло бути легко змінено через конфігурацію Vite.

З Vite 6 ім'я файлу за замовчуванням тепер використовує `"name"` у `package.json` подібно до вихідних файлів JS. Якщо [`build.lib.fileName`](/config/build-options.md#build-lib) встановлено рядком, значення також буде використано для імені вихідного файлу CSS. Щоб явно встановити інше ім'я файлу CSS, ви можете використовувати новий параметр [`build.lib.cssFileName`](/config/build-options.md#build-lib) для його налаштування.

Щоб мігрувати, якщо ви покладалися на ім'я файлу `style.css`, вам слід оновити посилання на нього до нового імені на основі вашого імені пакету. Наприклад:

```json [package.json]
{
  "name": "my-lib",
  "exports": {
    "./style.css": "./dist/style.css" // [!code --]
    "./style.css": "./dist/my-lib.css" // [!code ++]
  }
}
```

Якщо ви віддаєте перевагу залишитися з `style.css`, як у Vite 5, ви можете встановити `build.lib.cssFileName: 'style'` замість цього.

## Розширені

Є інші зміни, що ламають сумісність, які впливають лише на небагатьох користувачів.

- [[#15637] fix!: значення за замовчуванням `build.cssMinify` тепер `'esbuild'` для SSR](https://github.com/vitejs/vite/pull/15637)
  - [`build.cssMinify`](/config/build-options#build-cssminify) тепер увімкнено за замовчуванням навіть для SSR збірок.
- [[#18070] feat!: обхід проксі з WebSocket](https://github.com/vitejs/vite/pull/18070)
  - `server.proxy[path].bypass` тепер викликається для запитів на оновлення WebSocket, і в цьому випадку параметр `res` буде `undefined`.
- [[#18209] refactor!: мінімальна версія terser підвищена до 5.16.0](https://github.com/vitejs/vite/pull/18209)
  - Мінімально підтримувана версія terser для [`build.minify: 'terser'`](/config/build-options#build-minify) була підвищена до 5.16.0 з 5.4.0.
- [[#18231] chore(deps): оновлення залежності @rollup/plugin-commonjs до v28](https://github.com/vitejs/vite/pull/18231)
  - [`commonjsOptions.strictRequires`](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#strictrequires) тепер за замовчуванням `true` (було `'auto'` раніше).
    - Це може призвести до збільшення розміру збірки, але призведе до більш детермінованих збірок.
    - Якщо ви вказуєте файл CommonJS як точку входу, вам можуть знадобитися додаткові кроки. Прочитайте [документацію плагіна commonjs](https://github.com/rollup/plugins/blob/master/packages/commonjs/README.md#using-commonjs-files-as-entry-points) для отримання додаткової інформації.
- [[#18243] chore(deps)!: міграція `fast-glob` на `tinyglobby`](https://github.com/vitejs/vite/pull/18243)
  - Діапазонні дужки (`{01..03}` ⇒ `['01', '02', '03']`) та інкрементальні дужки (`{2..8..2}` ⇒ `['2', '4', '6', '8']`) більше не підтримуються в глобах.
- [[#18493] refactor!: видалення опції fs.cachedChecks](https://github.com/vitejs/vite/pull/18493)
  - Ця оптимізація за вибором була видалена через крайні випадки при записі файлу в кешовану папку та негайному імпорті його.

## Міграція з v4

Перевірте [Посібник з міграції з v4](https://v5.vite.dev/guide/migration.html) у документації Vite v5 спочатку, щоб побачити необхідні зміни для перенесення вашого додатку на Vite 5, а потім продовжуйте з змінами на цій сторінці.
