---
title: Vite 4.0 вийшов!
author:
  name: Команда Vite
date: 2022-12-09
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Анонс Vite 4
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite4.png
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite4
  - - meta
    - property: og:description
      content: Анонс релізу Vite 4
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vite 4.0 вийшов!

_9 грудня 2022_ - Ознайомтесь з [анонсом Vite 5.0](./announcing-vite5.md)

Vite 3 [був випущений](./announcing-vite3.md) п'ять місяців тому. Завантаження npm на тиждень зросли з 1 мільйона до 2,5 мільйонів з того часу. Екосистема також дозріла і продовжує зростати. У цьогорічному [опитуванні Jamstack Conf](https://twitter.com/vite_js/status/1589665610119585793) використання серед спільноти зросло з 14% до 32%, зберігаючи високий рейтинг задоволеності 9,7. Ми побачили стабільні релізи [Astro 1.0](https://astro.build/), [Nuxt 3](https://v3.nuxtjs.org/) та інших фреймворків на базі Vite, які інноваційні та співпрацюють: [SvelteKit](https://kit.svelte.dev/), [Solid Start](https://www.solidjs.com/blog/introducing-solidstart), [Qwik City](https://qwik.builder.io/qwikcity/overview/). Storybook оголосив про підтримку Vite як однієї з основних функцій для [Storybook 7.0](https://storybook.js.org/blog/first-class-vite-support-in-storybook/). Deno тепер [підтримує Vite](https://www.youtube.com/watch?v=Zjojo9wdvmY). [Vitest](https://vitest.dev) швидко набирає популярність, незабаром він становитиме половину завантажень npm Vite. Nx також інвестує в екосистему і [офіційно підтримує Vite](https://nx.dev/packages/vite).

[![Екосистема Vite 4](/ecosystem-vite4.png)](https://viteconf.org/2022/replay)

Як демонстрація зростання Vite та пов'язаних проектів, екосистема Vite зібралася 11 жовтня на [ViteConf 2022](https://viteconf.org/2022/replay). Ми побачили представників основних веб-фреймворків та інструментів, які розповідали історії інновацій та співпраці. І в символічному кроці команда Rollup вибрала саме цей день для випуску [Rollup 3](https://rollupjs.org).

Сьогодні команда Vite [з допомогою наших партнерів по екосистемі](https://vite.dev/team) рада оголосити про випуск Vite 4, який використовує Rollup 3 під час збірки. Ми працювали з екосистемою, щоб забезпечити плавний шлях оновлення для цього нового мажорного релізу. Vite тепер використовує [Rollup 3](https://github.com/vitejs/vite/issues/9870), що дозволило нам спростити внутрішню обробку активів Vite і має багато покращень. Дивіться [нотатки про випуск Rollup 3 тут](https://github.com/rollup/rollup/releases/tag/v3.0.0).

![Обкладинка анонсу Vite 4](/og-image-announcing-vite4.png)

Швидкі посилання:

- [Документація](/)
- [Посібник з міграції](https://v4.vite.dev/guide/migration.html)
- [Журнал змін](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#400-2022-12-09)

Документація іншими мовами:

- [简体中文](https://cn.vite.dev/)
- [日本語](https://ja.vite.dev/)
- [Español](https://es.vite.dev/)

Якщо ви нещодавно почали використовувати Vite, ми рекомендуємо прочитати [Посібник "Чому Vite"](https://vite.dev/guide/why.html) і ознайомитися з [Посібником з початку роботи](https://vite.dev/guide/) та [Посібником з функцій](https://vite.dev/guide/features). Якщо ви хочете долучитися, внески вітаються на [GitHub](https://github.com/vitejs/vite). Майже [700 співробітників](https://github.com/vitejs/vite/graphs/contributors) зробили внесок у Vite. Слідкуйте за оновленнями на [Twitter](https://twitter.com/vite_js) та [Mastodon](https://webtoo.ls/@vite), або приєднуйтесь до нашої [спільноти Discord](http://chat.vite.dev).

## Почніть грати з Vite 4

Використовуйте `pnpm create vite`, щоб створити проект Vite з вашим улюбленим фреймворком, або відкрийте стартовий шаблон онлайн, щоб пограти з Vite 4 за допомогою [vite.new](https://vite.new).

Ви також можете запустити `pnpm create vite-extra`, щоб отримати доступ до шаблонів з інших фреймворків та середовищ виконання (Solid, Deno, SSR та бібліотечні стартери). Шаблони `create vite-extra` також доступні, коли ви запускаєте `create vite` у розділі `Інші`.

Зверніть увагу, що стартові шаблони Vite призначені для використання як майданчик для тестування Vite з різними фреймворками. Коли ви створюєте свій наступний проект, ми рекомендуємо звертатися до стартових шаблонів, рекомендованих кожним фреймворком. Деякі фреймворки тепер перенаправляють у `create vite` до своїх стартових шаблонів (`create-vue` та `Nuxt 3` для Vue, та `SvelteKit` для Svelte).

## Новий плагін React, що використовує SWC під час розробки

[SWC](https://swc.rs/) тепер є зрілою заміною для [Babel](https://babeljs.io/), особливо в контексті проектів React. Реалізація SWC React Fast Refresh набагато швидша за Babel, і для деяких проектів це тепер краща альтернатива. З Vite 4 доступні два плагіни для проектів React з різними компромісами. Ми вважаємо, що обидва підходи варті підтримки на даний момент, і ми продовжимо досліджувати покращення обох плагінів у майбутньому.

### @vitejs/plugin-react

[@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react) - це плагін, який використовує esbuild та Babel, досягаючи швидкого HMR з невеликим розміром пакету та гнучкістю використання конвеєра перетворення Babel.

### @vitejs/plugin-react-swc (новий)

[@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) - це новий плагін, який використовує esbuild під час збірки, але замінює Babel на SWC під час розробки. Для великих проектів, які не потребують нестандартних розширень React, холодний старт та гаряча заміна модулів (HMR) можуть бути значно швидшими.

## Сумісність з браузерами

Збірка для сучасних браузерів тепер за замовчуванням орієнтована на `safari14` для ширшої сумісності з ES2020. Це означає, що сучасні збірки тепер можуть використовувати [`BigInt`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt) і що [оператор об'єднання з null](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) більше не транспілюється. Якщо вам потрібно підтримувати старіші браузери, ви можете додати [`@vitejs/plugin-legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy) як зазвичай.

## Імпорт CSS як рядка

У Vite 3 імпорт за замовчуванням з файлу `.css` міг призвести до подвійного завантаження CSS.

```ts
import cssString from './global.css'
```

Це подвійне завантаження могло відбутися, оскільки файл `.css` буде згенерований, і ймовірно, що рядок CSS також буде використаний кодом додатка — наприклад, ін'єктований середовищем виконання фреймворку. З Vite 4 експорт за замовчуванням з `.css` [був знецінений](https://github.com/vitejs/vite/issues/11094). У цьому випадку потрібно використовувати модифікатор суфікса запиту `?inline`, оскільки він не генерує імпортовані стилі `.css`.

```ts
import stuff from './global.css?inline'
```

Дізнайтеся більше в [Посібнику з міграції](https://v4.vite.dev/guide/migration.html).

## Змінні середовища

Vite тепер використовує `dotenv` 16 та `dotenv-expand` 9 (раніше `dotenv` 14 та `dotenv-expand` 5). Якщо у вас є значення, що включає `#` або `` ` ``, вам потрібно буде обгорнути їх у лапки.

```diff
-VITE_APP=ab#cd`ef
+VITE_APP="ab#cd`ef"
```

Для отримання додаткової інформації дивіться [журнал змін `dotenv`](https://github.com/motdotla/dotenv/blob/master/CHANGELOG.md) та [журнал змін `dotenv-expand`](https://github.com/motdotla/dotenv-expand/blob/master/CHANGELOG.md).

## Інші функції

- Скорочення CLI (натисніть `h` під час розробки, щоб побачити їх усі) ([#11228](https://github.com/vitejs/vite/pull/11228))
- Підтримка patch-package під час попереднього збирання залежностей ([#10286](https://github.com/vitejs/vite/issues/10286))
- Чистіший вивід журналів збірки ([#10895](https://github.com/vitejs/vite/issues/10895)) та перехід на `kB` для узгодження з інструментами розробки браузера ([#10982](https://github.com/vitejs/vite/issues/10982))
- Покращені повідомлення про помилки під час SSR ([#11156](https://github.com/vitejs/vite/issues/11156))

## Зменшений розмір пакету

Vite піклується про свій слід, щоб прискорити встановлення, особливо у випадку використання майданчиків для документації та відтворень. І знову ж таки, цей мажорний реліз приносить покращення в розмірі пакету Vite. Розмір встановлення Vite 4 на 23% менший порівняно з Vite 3.2.5 (14,1 МБ проти 18,3 МБ).

## Оновлення ядра Vite

[Ядро Vite](https://github.com/vitejs/vite) та [vite-ecosystem-ci](https://github.com/vitejs/vite-ecosystem-ci) продовжують розвиватися, щоб забезпечити кращий досвід для підтримувачів та співробітників і забезпечити масштабування розробки Vite для впоратися з ростом екосистеми.

### Плагіни фреймворків поза ядром

[`@vitejs/plugin-vue`](https://github.com/vitejs/vite-plugin-vue) та [`@vitejs/plugin-react`](https://github.com/vitejs/vite-plugin-react) були частиною монорепозиторію ядра Vite з перших версій Vite. Це допомогло нам отримати тісний зворотний зв'язок при внесенні змін, оскільки ми отримували як ядро, так і плагіни, які тестувалися та випускалися разом. З [vite-ecosystem-ci](https://github.com/vitejs/vite-ecosystem-ci) ми можемо отримати цей зворотний зв'язок з цими плагінами, розробленими в незалежних репозиторіях, тому з Vite 4 [вони були перенесені з монорепозиторію ядра Vite](https://github.com/vitejs/vite/pull/11158). Це важливо для історії Vite, яка не залежить від фреймворків, і дозволить нам створити незалежні команди для підтримки кожного з плагінів. Якщо у вас є помилки для звітування або функції для запиту, будь ласка, створюйте проблеми в нових репозиторіях: [`vitejs/vite-plugin-vue`](https://github.com/vitejs/vite-plugin-vue) та [`vitejs/vite-plugin-react`](https://github.com/vitejs/vite-plugin-react).

### Покращення vite-ecosystem-ci

[vite-ecosystem-ci](https://github.com/vitejs/vite-ecosystem-ci) розширює CI Vite, надаючи звіти про стан CI [більшості основних проектів](https://github.com/vitejs/vite-ecosystem-ci/tree/main/tests). Ми запускаємо vite-ecosystem-ci тричі на тиждень проти основної гілки Vite і отримуємо своєчасні звіти перед введенням регресії. Vite 4 незабаром буде сумісний з більшістю проектів, що використовують Vite, які вже підготували гілки з необхідними змінами і випустять їх у найближчі дні. Ми також можемо запускати vite-ecosystem-ci на вимогу на PR, використовуючи `/ecosystem-ci run` у коментарі, що дозволяє нам знати [ефект змін](https://github.com/vitejs/vite/pull/11269#issuecomment-1343365064) до того, як вони потраплять в основну гілку.

## Подяки

Vite 4 не був би можливий без незліченних годин роботи учасників Vite, багато з яких є підтримувачами проектів та плагінів, і зусиль [команди Vite](/team). Усі ми працювали разом, щоб знову покращити DX Vite для кожного фреймворку та додатка, що його використовує. Ми вдячні за можливість покращити спільну базу для такої яскравої екосистеми.

Ми також вдячні окремим особам та компаніям, які спонсорують команду Vite, та компаніям, які інвестують безпосередньо в майбутнє Vite: робота [@antfu7](https://twitter.com/antfu7) над Vite та екосистемою є частиною його роботи в [Nuxt Labs](https://nuxtlabs.com/), [Astro](https://astro.build) фінансує роботу [@bluwyoo](https://twitter.com/bluwyoo) над ядром Vite, а [StackBlitz](https://stackblitz.com/) наймає [@patak_dev](https://twitter.com/patak_dev) для роботи на повний робочий день над Vite.

## Наступні кроки

Нашим негайним фокусом буде сортування нових відкритих проблем, щоб уникнути порушень через можливі регресії. Якщо ви хочете долучитися та допомогти нам покращити Vite, ми пропонуємо почати з сортування проблем. Приєднуйтесь до [нашого Discord](https://chat.vite.dev) і звертайтесь до каналу `#contributing`. Поліруйте нашу історію `#docs` і допомагайте іншим у `#help`. Нам потрібно продовжувати будувати корисну та гостинну спільноту для наступної хвилі користувачів, оскільки прийняття Vite продовжує зростати.

Є багато відкритих фронтів для подальшого покращення DX для всіх, хто обрав Vite для живлення своїх фреймворків та розробки своїх додатків. Вперед!
