---
title: Vite 5.0 вийшов!
author:
  name: Команда Vite
date: 2023-11-16
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Анонс Vite 5
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite5.png
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite5
  - - meta
    - property: og:description
      content: Анонс випуску Vite 5
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vite 5.0 вийшов!

_16 листопада 2023 року_

![Обкладинка анонсу Vite 5](/og-image-announcing-vite5.png)

Vite 4 [був випущений](./announcing-vite4.md) майже рік тому і став надійною основою для екосистеми. Завантаження npm на тиждень зросли з 2,5 мільйонів до 7,5 мільйонів, оскільки проекти продовжують будуватися на спільній інфраструктурі. Фреймворки продовжували інновації, і на додаток до [Astro](https://astro.build/), [Nuxt](https://nuxt.com/), [SvelteKit](https://kit.svelte.dev/), [Solid Start](https://www.solidjs.com/blog/introducing-solidstart), [Qwik City](https://qwik.builder.io/qwikcity/overview/), серед інших, ми бачили нові фреймворки, які приєднуються і зміцнюють екосистему. [RedwoodJS](https://redwoodjs.com/) і [Remix](https://remix.run/) переходять на Vite, що прокладає шлях для подальшого впровадження в екосистему React. [Vitest](https://vitest.dev) продовжував зростати ще швидше, ніж Vite. Його команда наполегливо працювала і скоро [випустить Vitest 1.0](https://github.com/vitest-dev/vitest/issues/3596). Історія Vite у поєднанні з іншими інструментами, такими як [Storybook](https://storybook.js.org), [Nx](https://nx.dev) і [Playwright](https://playwright.dev), продовжувала покращуватися, і те ж саме стосується середовищ, де Vite dev працює як у [Deno](https://deno.com), так і у [Bun](https://bun.sh).

Місяць тому ми провели друге видання [ViteConf](https://viteconf.org/23/replay), організоване [StackBlitz](https://stackblitz.com). Як і минулого року, більшість проектів в екосистемі зібралися разом, щоб поділитися ідеями та продовжувати розширювати спільноту. Ми також бачимо нові інструменти, які доповнюють набір мета-фреймворків, такі як [Volar](https://volarjs.dev/) і [Nitro](https://nitro.unjs.io/). Команда Rollup випустила [Rollup 4](https://rollupjs.org) того ж дня, традицію, яку започаткував Лукас минулого року.

Шість місяців тому Vite 4.3 [був випущений](./announcing-vite4.md). Цей випуск значно покращив продуктивність dev-сервера. Однак, ще є багато місця для покращення. На ViteConf [Еван Ю представив довгостроковий план Vite щодо роботи над Rolldown](https://www.youtube.com/watch?v=hrdwQHoAp0M), портом Rollup на Rust з сумісними API. Коли він буде готовий, ми плануємо використовувати його в Vite Core для виконання завдань як Rollup, так і esbuild. Це означатиме підвищення продуктивності збірки (а пізніше і продуктивності dev, коли ми перенесемо чутливі до продуктивності частини Vite на Rust), і значне зменшення невідповідностей між dev і збіркою. Rolldown наразі знаходиться на ранніх стадіях, і команда готується відкрити кодову базу до кінця року. Слідкуйте за новинами!

Сьогодні ми відзначаємо ще одну важливу віху на шляху Vite. Команда [Vite](/team), [контрибутори](https://github.com/vitejs/vite/graphs/contributors) та партнери екосистеми раді оголосити про випуск Vite 5. Vite тепер використовує [Rollup 4](https://github.com/vitejs/vite/pull/14508), що вже представляє значне підвищення продуктивності збірки. Також є нові опції для покращення профілю продуктивності вашого dev-сервера.

Vite 5 зосереджується на очищенні API (видаленні застарілих функцій) і спрощенні кількох функцій, закриваючи давні проблеми, наприклад, перехід `define` на використання правильних замін AST замість регулярних виразів. Ми також продовжуємо робити кроки для майбутнього Vite (тепер потрібен Node.js 18+, і [CJS Node API було застаріло](/guide/migration#deprecate-cjs-node-api)).

Швидкі посилання:

- [Документація](/)
- [Посібник з міграції](/guide/migration)
- [Журнал змін](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#500-2023-11-16)

Документація іншими мовами:

- [简体中文](https://cn.vite.dev/)
- [日本語](https://ja.vite.dev/)
- [Español](https://es.vite.dev/)
- [Português](https://pt.vite.dev/)
- [한국어](https://ko.vite.dev/)
- [Deutsch](https://de.vite.dev/) (новий переклад!)

Якщо ви новачок у Vite, ми рекомендуємо спочатку прочитати [Посібник з початку роботи](/guide/) та [Посібник з функцій](/guide/features).

Ми вдячні понад [850 контрибуторам до Vite Core](https://github.com/vitejs/vite/graphs/contributors), а також підтримувачам і контрибуторам плагінів Vite, інтеграцій, інструментів та перекладів, які допомогли нам досягти цього. Ми заохочуємо вас долучатися і продовжувати покращувати Vite разом з нами. Ви можете дізнатися більше в нашому [Посібнику з контрибуції](https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md). Щоб почати, ми рекомендуємо [тріажити проблеми](https://github.com/vitejs/vite/issues), [переглядати PR](https://github.com/vitejs/vite/pulls), надсилати PR з невдалими тестами на основі відкритих проблем і допомагати іншим у [Дискусіях](https://github.com/vitejs/vite/discussions) та на форумі допомоги Vite Land [форум допомоги](https://discord.com/channels/804011606160703521/1019670660856942652). Ви багато чого навчитеся на цьому шляху і матимете гладкий шлях до подальших контрибуцій до проекту. Якщо у вас є сумніви, приєднуйтесь до нашої [спільноти Discord](http://chat.vite.dev/) і привітайтеся на каналі [#contributing](https://discord.com/channels/804011606160703521/804439875226173480).

Щоб бути в курсі новин, слідкуйте за нами на [X](https://twitter.com/vite_js) або [Mastodon](https://webtoo.ls/@vite).

## Швидкий старт з Vite 5

Використовуйте `pnpm create vite`, щоб створити проект Vite з вашим улюбленим фреймворком, або відкрийте стартовий шаблон онлайн, щоб пограти з Vite 5 за допомогою [vite.new](https://vite.new). Ви також можете запустити `pnpm create vite-extra`, щоб отримати доступ до шаблонів з інших фреймворків і середовищ (Solid, Deno, SSR і стартові бібліотеки). Шаблони `create vite-extra` також доступні, коли ви запускаєте `create vite` під опцією `Інші`.

Зверніть увагу, що стартові шаблони Vite призначені для використання як майданчик для тестування Vite з різними фреймворками. При створенні вашого наступного проекту ми рекомендуємо звертатися до стартових шаблонів, рекомендованих кожним фреймворком. Деякі фреймворки тепер перенаправляють у `create vite` до своїх стартових шаблонів (`create-vue` і `Nuxt 3` для Vue, і `SvelteKit` для Svelte).

## Підтримка Node.js

Vite більше не підтримує Node.js 14 / 16 / 17 / 19, які досягли свого EOL. Тепер потрібен Node.js 18 / 20+.

## Продуктивність

На додаток до покращень продуктивності збірки Rollup 4, є новий посібник, який допоможе вам виявити та виправити поширені проблеми з продуктивністю на [https://vite.dev/guide/performance](/guide/performance).

Vite 5 також вводить [server.warmup](/guide/performance.html#warm-up-frequently-used-files), нову функцію для покращення часу запуску. Вона дозволяє визначити список модулів, які повинні бути попередньо трансформовані, як тільки сервер запускається. При використанні [`--open` або `server.open`](/config/server-options.html#server-open), Vite також автоматично прогріє точку входу вашого додатку або наданий URL для відкриття.

## Основні зміни

- [Vite тепер працює на Rollup 4](/guide/migration#rollup-4)
- [CJS Node API було застаріло](/guide/migration#deprecate-cjs-node-api)
- [Переробка стратегії заміни `define` і `import.meta.env.*`](/guide/migration#rework-define-and-import-meta-env-replacement-strategy)
- [Значення зовнішніх модулів SSR тепер відповідає виробництву](/guide/migration#ssr-externalized-modules-value-now-matches-production)
- [`worker.plugins` тепер функція](/guide/migration#worker-plugins-is-now-a-function)
- [Дозволити шлях, що містить `.` для повернення до index.html](/guide/migration#allow-path-containing-to-fallback-to-index-html)
- [Узгодження поведінки обслуговування HTML у dev і preview](/guide/migration#align-dev-and-preview-html-serving-behaviour)
- [Файли маніфесту тепер генеруються за замовчуванням у директорії `.vite`](/guide/migration#manifest-files-are-now-generated-in-vite-directory-by-default)
- [Ярлики CLI вимагають додаткового натискання `Enter`](/guide/migration#cli-shortcuts-require-an-additional-enter-press)
- [Оновлення поведінки TypeScript для `experimentalDecorators` і `useDefineForClassFields`](/guide/migration#update-experimentaldecorators-and-usedefineforclassfields-typescript-behaviour)
- [Видалення прапора `--https` і `https: true`](/guide/migration#remove-https-flag-and-https-true)
- [Видалення API `resolvePackageEntry` і `resolvePackageData`](/guide/migration#remove-resolvepackageentry-and-resolvepackagedata-apis)
- [Видалення раніше застарілих API](/guide/migration#removed-deprecated-apis)
- [Детальніше про складні зміни, що впливають на авторів плагінів та інструментів](/guide/migration#advanced)

## Міграція на Vite 5

Ми працювали з партнерами екосистеми, щоб забезпечити плавну міграцію до цього нового мажорного випуску. Знову ж таки, [vite-ecosystem-ci](https://www.youtube.com/watch?v=7L4I4lDzO48) був вирішальним для допомоги нам у здійсненні сміливіших змін, уникаючи регресій. Ми раді бачити, як інші екосистеми приймають подібні схеми для покращення співпраці між їхніми проектами та підтримувачами.

Для більшості проектів оновлення до Vite 5 має бути простим. Але ми радимо переглянути [детальний посібник з міграції](/guide/migration) перед оновленням.

Низькорівневий розбір з повним списком змін у ядрі Vite можна знайти в [Журналі змін Vite 5](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#500-2023-11-16).

## Подяки

Vite 5 є результатом довгих годин роботи нашої спільноти контрибуторів, підтримувачів, авторів плагінів та [Команди Vite](/team). Велика подяка [Бйорну Лу](https://twitter.com/bluwyoo) за керівництво процесом випуску цього мажорного випуску.

Ми також вдячні особам та компаніям, які спонсорують розробку Vite. [StackBlitz](https://stackblitz.com/), [Nuxt Labs](https://nuxtlabs.com/) і [Astro](https://astro.build) продовжують інвестувати у Vite, наймаючи членів команди Vite. Особлива подяка спонсорам на [GitHub Sponsors Vite](https://github.com/sponsors/vitejs), [Open Collective Vite](https://opencollective.com/vite) та [GitHub Sponsors Evan You](https://github.com/sponsors/yyx990803). Особлива подяка [Remix](https://remix.run/) за те, що стали золотим спонсором і внесли свій вклад після переходу на Vite.
