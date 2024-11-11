# Змінні середовища та режими

## Змінні середовища

Vite надає змінні середовища через спеціальний об'єкт **`import.meta.env`**, які статично замінюються під час збірки. Деякі вбудовані змінні доступні у всіх випадках:

- **`import.meta.env.MODE`**: {string} [режим](#режими), в якому працює додаток.

- **`import.meta.env.BASE_URL`**: {string} базовий URL, з якого обслуговується додаток. Це визначається за допомогою [опції конфігурації `base`](/config/shared-options.md#base).

- **`import.meta.env.PROD`**: {boolean} чи працює додаток у режимі виробництва (запуск dev-сервера з `NODE_ENV='production'` або запуск додатка, зібраного з `NODE_ENV='production'`).

- **`import.meta.env.DEV`**: {boolean} чи працює додаток у режимі розробки (завжди протилежне до `import.meta.env.PROD`).

- **`import.meta.env.SSR`**: {boolean} чи працює додаток на [сервері](./ssr.md#conditional-logic).

## Файли `.env`

Vite використовує [dotenv](https://github.com/motdotla/dotenv) для завантаження додаткових змінних середовища з наступних файлів у вашій [директорії середовища](/config/shared-options.md#envdir):

```
.env                # завантажується у всіх випадках
.env.local          # завантажується у всіх випадках, ігнорується git
.env.[mode]         # завантажується тільки у вказаному режимі
.env.[mode].local   # завантажується тільки у вказаному режимі, ігнорується git
```

:::tip Пріоритети завантаження змінних середовища

Файл змінних середовища для конкретного режиму (наприклад, `.env.production`) матиме вищий пріоритет, ніж загальний файл (наприклад, `.env`).

Крім того, змінні середовища, які вже існують під час запуску Vite, мають найвищий пріоритет і не будуть перезаписані файлами `.env`. Наприклад, під час запуску `VITE_SOME_KEY=123 vite build`.

Файли `.env` завантажуються на початку роботи Vite. Перезапустіть сервер після внесення змін.
:::

Завантажені змінні середовища також доступні у вашому клієнтському вихідному коді через `import.meta.env` як рядки.

Щоб запобігти випадковому витоку змінних середовища до клієнта, тільки змінні з префіксом `VITE_` доступні у вашому коді, обробленому Vite. Наприклад, для наступних змінних середовища:

```[.env]
VITE_SOME_KEY=123
DB_PASSWORD=foobar
```

Тільки `VITE_SOME_KEY` буде доступний як `import.meta.env.VITE_SOME_KEY` у вашому клієнтському вихідному коді, але `DB_PASSWORD` не буде.

```js
console.log(import.meta.env.VITE_SOME_KEY) // "123"
console.log(import.meta.env.DB_PASSWORD) // undefined
```

:::tip Парсинг змінних середовища

Як показано вище, `VITE_SOME_KEY` є числом, але повертається як рядок під час парсингу. Те ж саме відбудеться і для булевих змінних середовища. Переконайтеся, що ви конвертуєте до потрібного типу під час використання у вашому коді.
:::

Також Vite використовує [dotenv-expand](https://github.com/motdotla/dotenv-expand) для розширення змінних, записаних у файлах середовища, з коробки. Щоб дізнатися більше про синтаксис, перегляньте [їх документацію](https://github.com/motdotla/dotenv-expand#what-rules-does-the-expansion-engine-follow).

Зверніть увагу, що якщо ви хочете використовувати `$` у значенні вашої змінної середовища, вам потрібно екранувати його за допомогою `\`.

```[.env]
KEY=123
NEW_KEY1=test$foo   # test
NEW_KEY2=test\$foo  # test$foo
NEW_KEY3=test$KEY   # test123
```

Якщо ви хочете налаштувати префікс змінних середовища, перегляньте опцію [envPrefix](/config/shared-options.html#envprefix).

:::warning ЗАУВАЖЕННЯ ЩОДО БЕЗПЕКИ

- Файли `.env.*.local` є локальними і можуть містити конфіденційні змінні. Ви повинні додати `*.local` до вашого `.gitignore`, щоб уникнути їх потрапляння до git.

- Оскільки будь-які змінні, доступні вашому вихідному коду Vite, потраплять до вашого клієнтського бандлу, змінні `VITE_*` не повинні містити конфіденційну інформацію.
  :::

### IntelliSense для TypeScript

За замовчуванням Vite надає визначення типів для `import.meta.env` у [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts). Хоча ви можете визначити більше користувацьких змінних середовища у файлах `.env.[mode]`, ви можете захотіти отримати IntelliSense для TypeScript для користувацьких змінних середовища, які мають префікс `VITE_`.

Щоб досягти цього, ви можете створити файл `vite-env.d.ts` у директорії `src`, а потім розширити `ImportMetaEnv` таким чином:

```typescript [vite-env.d.ts]
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // більше змінних середовища...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

Якщо ваш код залежить від типів з середовищ браузера, таких як [DOM](https://github.com/microsoft/TypeScript/blob/main/src/lib/dom.generated.d.ts) та [WebWorker](https://github.com/microsoft/TypeScript/blob/main/src/lib/webworker.generated.d.ts), ви можете оновити поле [lib](https://www.typescriptlang.org/tsconfig#lib) у `tsconfig.json`.

```json [tsconfig.json]
{
  "lib": ["WebWorker"]
}
```

:::warning Імпорти порушать розширення типів

Якщо розширення `ImportMetaEnv` не працює, переконайтеся, що у вас немає жодних операторів `import` у файлі `vite-env.d.ts`. Дивіться [документацію TypeScript](https://www.typescriptlang.org/docs/handbook/2/modules.html#how-javascript-modules-are-defined) для отримання додаткової інформації.
:::

## Заміна змінних середовища в HTML

Vite також підтримує заміну змінних середовища у файлах HTML. Будь-які властивості з `import.meta.env` можуть бути використані у файлах HTML зі спеціальним синтаксисом `%ENV_NAME%`:

```html
<h1>Vite працює в режимі %MODE%</h1>
<p>Використання даних з %VITE_API_URL%</p>
```

Якщо змінна середовища не існує в `import.meta.env`, наприклад, `%NON_EXISTENT%`, вона буде проігнорована і не замінена, на відміну від `import.meta.env.NON_EXISTENT` у JS, де вона замінюється на `undefined`.

Оскільки Vite використовується багатьма фреймворками, він навмисно не має думки щодо складних замін, таких як умовні вирази. Vite можна розширити за допомогою [існуючого плагіна користувача](https://github.com/vitejs/awesome-vite#transformers) або користувацького плагіна, який реалізує [хук `transformIndexHtml`](./api-plugin#transformindexhtml).

## Режими

За замовчуванням dev-сервер (`dev` команда) працює в режимі `development`, а команда `build` працює в режимі `production`.

Це означає, що при запуску `vite build`, він завантажить змінні середовища з `.env.production`, якщо такий файл існує:

```
# .env.production
VITE_APP_TITLE=Мій додаток
```

У вашому додатку ви можете відобразити заголовок, використовуючи `import.meta.env.VITE_APP_TITLE`.

У деяких випадках ви можете захотіти запустити `vite build` з іншим режимом, щоб відобразити інший заголовок. Ви можете перезаписати режим за замовчуванням, використовуючи прапорець опції `--mode`. Наприклад, якщо ви хочете зібрати ваш додаток для режиму staging:

```bash
vite build --mode staging
```

І створіть файл `.env.staging`:

```
# .env.staging
VITE_APP_TITLE=Мій додаток (staging)
```

Оскільки `vite build` за замовчуванням виконує збірку для виробництва, ви також можете змінити це і виконати збірку для розробки, використовуючи інший режим і конфігурацію файлів `.env`:

```
# .env.testing
NODE_ENV=development
```

## NODE_ENV та режими

Важливо зазначити, що `NODE_ENV` (`process.env.NODE_ENV`) та режими - це два різні поняття. Ось як різні команди впливають на `NODE_ENV` та режим:

| Команда                                              | NODE_ENV        | Режим            |
| ---------------------------------------------------- | --------------- | --------------- |
| `vite build`                                         | `"production"`  | `"production"`  |
| `vite build --mode development`                      | `"production"`  | `"development"` |
| `NODE_ENV=development vite build`                    | `"development"` | `"production"`  |
| `NODE_ENV=development vite build --mode development` | `"development"` | `"development"` |

Різні значення `NODE_ENV` та режиму також відображаються на відповідних властивостях `import.meta.env`:

| Команда                | `import.meta.env.PROD` | `import.meta.env.DEV` |
| ---------------------- | ---------------------- | --------------------- |
| `NODE_ENV=production`  | `true`                 | `false`               |
| `NODE_ENV=development` | `false`                | `true`                |
| `NODE_ENV=other`       | `false`                | `true`                |

| Команда              | `import.meta.env.MODE` |
| -------------------- | ---------------------- |
| `--mode production`  | `"production"`         |
| `--mode development` | `"development"`        |
| `--mode staging`     | `"staging"`            |

:::tip `NODE_ENV` у файлах `.env`

`NODE_ENV=...` можна встановити у команді, а також у вашому файлі `.env`. Якщо `NODE_ENV` вказано у файлі `.env.[mode]`, режим можна використовувати для контролю його значення. Однак, `NODE_ENV` та режими залишаються двома різними поняттями.

Основна перевага `NODE_ENV=...` у команді полягає в тому, що це дозволяє Vite виявити значення раніше. Це також дозволяє вам читати `process.env.NODE_ENV` у вашій конфігурації Vite, оскільки Vite може завантажити файли середовища тільки після оцінки конфігурації.
:::

