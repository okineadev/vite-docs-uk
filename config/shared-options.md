# Спільні Опції

Якщо не зазначено інше, опції в цьому розділі застосовуються до всіх режимів розробки, збірки та попереднього перегляду.

## root

- **Тип:** `string`
- **За замовчуванням:** `process.cwd()`

Коренева директорія проекту (де знаходиться `index.html`). Може бути абсолютним шляхом або шляхом відносно поточного робочого каталогу.

Дивіться [Кореневий каталог проекту](/guide/#index-html-and-project-root) для отримання додаткової інформації.

## base

- **Тип:** `string`
- **За замовчуванням:** `/`
- **Пов'язано:** [`server.origin`](/config/server-options.md#server-origin)

Базовий публічний шлях при обслуговуванні в режимі розробки або виробництва. Дійсні значення включають:

- Абсолютний URL шлях, наприклад, `/foo/`
- Повний URL, наприклад, `https://bar.com/foo/` (частина походження не буде використовуватися в режимі розробки, тому значення таке ж, як `/foo/`)
- Порожній рядок або `./` (для вбудованого розгортання)

Дивіться [Публічний базовий шлях](/guide/build#public-base-path) для отримання додаткової інформації.

## mode

- **Тип:** `string`
- **За замовчуванням:** `'development'` для serve, `'production'` для build

Вказівка цього в конфігурації перевизначить режим за замовчуванням для **як serve, так і build**. Це значення також може бути перевизначено за допомогою опції командного рядка `--mode`.

Дивіться [Змінні середовища та режими](/guide/env-and-mode) для отримання додаткової інформації.

## define

- **Тип:** `Record<string, any>`

Визначте глобальні заміни констант. Записи будуть визначені як глобальні під час розробки та статично замінені під час збірки.

Vite використовує [esbuild defines](https://esbuild.github.io/api/#define) для виконання замін, тому вирази значень повинні бути рядком, що містить значення, яке можна серіалізувати в JSON (null, boolean, number, string, array або object) або один ідентифікатор. Для не-рядкових значень Vite автоматично перетворить їх на рядок за допомогою `JSON.stringify`.

**Приклад:**

```js
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('v1.0.0'),
    __API_URL__: 'window.__backend_api_url',
  },
})
```

::: tip ПРИМІТКА
Для користувачів TypeScript, переконайтеся, що ви додали оголошення типів у файл `env.d.ts` або `vite-env.d.ts`, щоб отримати перевірку типів та Intellisense.

Приклад:

```ts
// vite-env.d.ts
declare const __APP_VERSION__: string
```

:::

## plugins

- **Тип:** `(Plugin | Plugin[] | Promise<Plugin | Plugin[]>)[]`

Масив плагінів для використання. Хибні плагіни ігноруються, а масиви плагінів розгортаються. Якщо повертається обіцянка, вона буде вирішена перед запуском. Дивіться [API плагінів](/guide/api-plugin) для отримання додаткової інформації про плагіни Vite.

## publicDir

- **Тип:** `string | false`
- **За замовчуванням:** `"public"`

Директорія для обслуговування як простих статичних ресурсів. Файли в цій директорії обслуговуються за адресою `/` під час розробки та копіюються до кореня `outDir` під час збірки, і завжди обслуговуються або копіюються як є без перетворення. Значення може бути або абсолютним шляхом файлової системи, або шляхом відносно кореня проекту.

Визначення `publicDir` як `false` вимикає цю функцію.

Дивіться [Директорія `public`](/guide/assets#the-public-directory) для отримання додаткової інформації.

## cacheDir

- **Тип:** `string`
- **За замовчуванням:** `"node_modules/.vite"`

Директорія для збереження кеш-файлів. Файли в цій директорії є попередньо зібраними залежностями або іншими кеш-файлами, згенерованими vite, що може покращити продуктивність. Ви можете використовувати прапорець `--force` або вручну видалити директорію для регенерації кеш-файлів. Значення може бути або абсолютним шляхом файлової системи, або шляхом відносно кореня проекту. За замовчуванням `.vite`, коли не виявлено package.json.

## resolve.alias

- **Тип:**
  `Record<string, string> | Array<{ find: string | RegExp, replacement: string, customResolver?: ResolverFunction | ResolverObject }>`

Буде передано до `@rollup/plugin-alias` як його [опція entries](https://github.com/rollup/plugins/tree/master/packages/alias#entries). Може бути або об'єктом, або масивом пар `{ find, replacement, customResolver }`.

При створенні псевдонімів для шляхів файлової системи завжди використовуйте абсолютні шляхи. Відносні значення псевдонімів будуть використовуватися як є і не будуть перетворені на шляхи файлової системи.

Більш просунуте налаштування можна досягти за допомогою [плагінів](/guide/api-plugin).

::: warning Використання з SSR
Якщо ви налаштували псевдоніми для [зовнішніх залежностей SSR](/guide/ssr.md#ssr-externals), можливо, ви захочете створити псевдоніми для фактичних пакетів `node_modules`. І Yarn, і pnpm підтримують створення псевдонімів за допомогою префікса `npm:`.
:::

## resolve.dedupe

- **Тип:** `string[]`

Якщо у вас є дубльовані копії однієї і тієї ж залежності у вашому додатку (ймовірно через підняття або пов'язані пакети в монорепозиторіях), використовуйте цю опцію, щоб змусити Vite завжди вирішувати вказані залежності до однієї копії (з кореня проекту).

:::warning SSR + ESM
Для збірок SSR, дедуплікація не працює для вихідних даних збірки ESM, налаштованих з `build.rollupOptions.output`. Обхідним шляхом є використання вихідних даних збірки CJS, поки ESM не матиме кращої підтримки плагінів для завантаження модулів.
:::

## resolve.conditions

- **Тип:** `string[]`
- **За замовчуванням:** `['module', 'browser', 'development|production']`

Додаткові дозволені умови при вирішенні [умовних експортів](https://nodejs.org/api/packages.html#packages_conditional_exports) з пакета.

Пакет з умовними експортами може мати наступне поле `exports` у своєму `package.json`:

```json
{
  "exports": {
    ".": {
      "import": "./index.mjs",
      "require": "./index.js"
    }
  }
}
```

Тут `import` і `require` є "умовами". Умови можуть бути вкладеними і повинні бути вказані від найбільш специфічних до найменш специфічних.

`development|production` є спеціальним значенням, яке замінюється на `production` або `development` залежно від значення `process.env.NODE_ENV`. Воно замінюється на `production`, коли `process.env.NODE_ENV === 'production'` і на `development` в іншому випадку.

Зверніть увагу, що умови `import`, `require`, `default` завжди застосовуються, якщо вимоги виконуються.

:::warning Вирішення підшляхових експортів
Ключі експорту, що закінчуються на "/", застаріли в Node і можуть працювати некоректно. Будь ласка, зверніться до автора пакета, щоб використовувати [`*` підшляхові шаблони](https://nodejs.org/api/packages.html#package-entry-points) замість цього.
:::

## resolve.mainFields

- **Тип:** `string[]`
- **За замовчуванням:** `['browser', 'module', 'jsnext:main', 'jsnext']`

Список полів у `package.json`, які слід спробувати при вирішенні точки входу пакета. Зверніть увагу, що це має нижчий пріоритет, ніж умовні експорти, вирішені з поля `exports`: якщо точка входу успішно вирішена з `exports`, основне поле буде ігноровано.

## resolve.extensions

- **Тип:** `string[]`
- **За замовчуванням:** `['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json']`

Список розширень файлів, які слід спробувати для імпортів, що опускають розширення. Зверніть увагу, що **НЕ** рекомендується опускати розширення для користувацьких типів імпорту (наприклад, `.vue`), оскільки це може заважати підтримці IDE та типів.

## resolve.preserveSymlinks

- **Тип:** `boolean`
- **За замовчуванням:** `false`

Увімкнення цього налаштування змушує vite визначати ідентичність файлу за оригінальним шляхом файлу (тобто шляхом без слідування символічним посиланням) замість реального шляху файлу (тобто шляху після слідування символічним посиланням).

- **Пов'язано:** [esbuild#preserve-symlinks](https://esbuild.github.io/api/#preserve-symlinks), [webpack#resolve.symlinks
  ](https://webpack.js.org/configuration/resolve/#resolvesymlinks)

## html.cspNonce

- **Тип:** `string`
- **Пов'язано:** [Політика безпеки вмісту (CSP)](/guide/features#content-security-policy-csp)

Значення nonce, яке буде використовуватися при генерації тегів script / style. Встановлення цього значення також згенерує мета-тег зі значенням nonce.

## css.modules

- **Тип:**
  ```ts
  interface CSSModulesOptions {
    getJSON?: (
      cssFileName: string,
      json: Record<string, string>,
      outputFileName: string,
    ) => void
    scopeBehaviour?: 'global' | 'local'
    globalModulePaths?: RegExp[]
    exportGlobals?: boolean
    generateScopedName?:
      | string
      | ((name: string, filename: string, css: string) => string)
    hashPrefix?: string
    /**
     * за замовчуванням: undefined
     */
    localsConvention?:
      | 'camelCase'
      | 'camelCaseOnly'
      | 'dashes'
      | 'dashesOnly'
      | ((
          originalClassName: string,
          generatedClassName: string,
          inputFile: string,
        ) => string)
  }
  ```

Налаштування поведінки CSS модулів. Опції передаються до [postcss-modules](https://github.com/css-modules/postcss-modules).

Ця опція не має жодного ефекту при використанні [Lightning CSS](../guide/features.md#lightning-css). Якщо увімкнено, слід використовувати [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html).

## css.postcss

- **Тип:** `string | (postcss.ProcessOptions & { plugins?: postcss.AcceptedPlugin[] })`

Вбудована конфігурація PostCSS або користувацька директорія для пошуку конфігурації PostCSS (за замовчуванням корінь проекту).

Для вбудованої конфігурації PostCSS очікується такий самий формат, як у `postcss.config.js`. Але для властивості `plugins` можна використовувати лише [формат масиву](https://github.com/postcss/postcss-load-config/blob/main/README.md#array).

Пошук здійснюється за допомогою [postcss-load-config](https://github.com/postcss/postcss-load-config) і завантажуються лише підтримувані імена конфігураційних файлів. Конфігураційні файли за межами кореня робочої області (або [кореня проекту](/guide/#index-html-and-project-root), якщо робоча область не знайдена) за замовчуванням не шукаються. Ви можете вказати користувацький шлях за межами кореня для завантаження конкретного конфігураційного файлу, якщо це необхідно.

Зверніть увагу, що якщо надано вбудовану конфігурацію, Vite не буде шукати інші джерела конфігурації PostCSS.

## css.preprocessorOptions

- **Тип:** `Record<string, object>`

Вкажіть опції для передачі CSS препроцесорам. Розширення файлів використовуються як ключі для опцій. Підтримувані опції для кожного препроцесора можна знайти в їх відповідній документації:

- `sass`/`scss`:
  - Виберіть API sass для використання з `api: "modern-compiler" | "modern" | "legacy"` (за замовчуванням `"modern-compiler"`, якщо встановлено `sass-embedded`, інакше `"modern"`). Для найкращої продуктивності рекомендується використовувати `api: "modern-compiler"` з пакетом `sass-embedded`. API `"legacy"` застаріло і буде видалено у Vite 7.
  - [Опції (modern)](https://sass-lang.com/documentation/js-api/interfaces/stringoptions/)
  - [Опції (legacy)](https://sass-lang.com/documentation/js-api/interfaces/LegacyStringOptions).
- `less`: [Опції](https://lesscss.org/usage/#less-options).
- `styl`/`stylus`: Підтримується лише [`define`](https://stylus-lang.com/docs/js.html#define-name-node), який можна передати як об'єкт.

**Приклад:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        math: 'parens-division',
      },
      styl: {
        define: {
          $specialColor: new stylus.nodes.RGBA(51, 197, 255, 1),
        },
      },
      scss: {
        api: 'modern-compiler', // або "modern", "legacy"
        importers: [
          // ...
        ],
      },
    },
  },
})
```

### css.preprocessorOptions[extension].additionalData

- **Тип:** `string | ((source: string, filename: string) => (string | { content: string; map?: SourceMap }))`

Ця опція може бути використана для ін'єкції додаткового коду для кожного стилю. Зверніть увагу, що якщо ви включаєте фактичні стилі, а не лише змінні, ці стилі будуть дубльовані у фінальному бандлі.

**Приклад:**

```js
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `$injectedColor: orange;`,
      },
    },
  },
})
```

## css.preprocessorMaxWorkers

- **Експериментально:** [Залишити відгук](https://github.com/vitejs/vite/discussions/15835)
- **Тип:** `number | true`
- **За замовчуванням:** `0` (не створює жодних робітників і виконується в основному потоці)

Якщо ця опція встановлена, CSS препроцесори будуть виконуватися в робітниках, коли це можливо. `true` означає кількість процесорів мінус 1.

## css.devSourcemap

- **Експериментально:** [Залишити відгук](https://github.com/vitejs/vite/discussions/13845)
- **Тип:** `boolean`
- **За замовчуванням:** `false`

Чи увімкнути sourcemaps під час розробки.

## css.transformer

- **Експериментально:** [Залишити відгук](https://github.com/vitejs/vite/discussions/13835)
- **Тип:** `'postcss' | 'lightningcss'`
- **За замовчуванням:** `'postcss'`

Вибір двигуна для обробки CSS. Дивіться [Lightning CSS](../guide/features.md#lightning-css) для отримання додаткової інформації.

::: info Дублювання `@import`
Зверніть увагу, що postcss (postcss-import) має іншу поведінку з дубльованими `@import` у порівнянні з браузерами. Дивіться [postcss/postcss-import#462](https://github.com/postcss/postcss-import/issues/462).
:::

## css.lightningcss

- **Експериментально:** [Залишити відгук](https://github.com/vitejs/vite/discussions/13835)
- **Тип:**

```js
import type {
  CSSModulesConfig,
  Drafts,
  Features,
  NonStandard,
  PseudoClasses,
  Targets,
} from 'lightningcss'
```

```js
{
  targets?: Targets
  include?: Features
  exclude?: Features
  drafts?: Drafts
  nonStandard?: NonStandard
  pseudoClasses?: PseudoClasses
  unusedSymbols?: string[]
  cssModules?: CSSModulesConfig,
  // ...
}
```

Налаштування Lightning CSS. Повні опції трансформації можна знайти в [репозиторії Lightning CSS](https://github.com/parcel-bundler/lightningcss/blob/master/node/index.d.ts).

## json.namedExports

- **Тип:** `boolean`
- **За замовчуванням:** `true`

Чи підтримувати іменовані імпорти з `.json` файлів.

## json.stringify

- **Тип:** `boolean | 'auto'`
- **За замовчуванням:** `'auto'`

Якщо встановлено `true`, імпортований JSON буде перетворено на `export default JSON.parse("...")`, що значно продуктивніше, ніж об'єктні літерали, особливо коли JSON файл великий.

Якщо встановлено `'auto'`, дані будуть серіалізовані лише якщо [дані більші за 10kB](https://v8.dev/blog/cost-of-javascript-2019#json:~:text=A%20good%20rule%20of%20thumb%20is%20to%20apply%20this%20technique%20for%20objects%20of%2010%20kB%20or%20larger).

## esbuild

- **Тип:** `ESBuildOptions | false`

`ESBuildOptions` розширює [опції трансформації esbuild](https://esbuild.github.io/api/#transform). Найпоширеніший випадок використання - налаштування JSX:

```js
export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

За замовчуванням esbuild застосовується до файлів `ts`, `jsx` та `tsx`. Ви можете налаштувати це за допомогою `esbuild.include` та `esbuild.exclude`, які можуть бути регулярним виразом, [шаблоном picomatch](https://github.com/micromatch/picomatch#globbing-features) або масивом будь-якого з них.

Крім того, ви також можете використовувати `esbuild.jsxInject` для автоматичного ін'єкції імпортів JSX хелперів для кожного файлу, який трансформується за допомогою esbuild:

```js
export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

Коли [`build.minify`](./build-options.md#build-minify) встановлено в `true`, всі оптимізації мінімізації застосовуються за замовчуванням. Щоб вимкнути [певні аспекти](https://esbuild.github.io/api/#minify) цього, встановіть будь-яку з опцій `esbuild.minifyIdentifiers`, `esbuild.minifySyntax` або `esbuild.minifyWhitespace` в `false`. Зверніть увагу, що опція `esbuild.minify` не може бути використана для перевизначення `build.minify`.

Встановіть в `false`, щоб вимкнути перетворення esbuild.

## assetsInclude

- **Тип:** `string | RegExp | (string | RegExp)[]`
- **Пов'язано:** [Обробка статичних ресурсів](/guide/assets)

Вкажіть додаткові [шаблони picomatch](https://github.com/micromatch/picomatch#globbing-features), які слід розглядати як статичні ресурси, щоб:

- Вони були виключені з плагінового конвеєра перетворень, коли запитуються з HTML або безпосередньо через `fetch` або XHR.

- Імпортуючи їх з JS, буде повернуто їхній вирішений URL-рядок (це можна перевизначити, якщо у вас є плагін з `enforce: 'pre'`, щоб обробляти цей тип ресурсу по-іншому).

Вбудований список типів ресурсів можна знайти [тут](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/constants.ts).

**Приклад:**

```js
export default defineConfig({
  assetsInclude: ['**/*.gltf'],
})
```

## logLevel

- **Тип:** `'info' | 'warn' | 'error' | 'silent'`

Налаштуйте рівень деталізації виводу в консоль. За замовчуванням `'info'`.

## customLogger

- **Тип:**
  ```ts
  interface Logger {
    info(msg: string, options?: LogOptions): void
    warn(msg: string, options?: LogOptions): void
    warnOnce(msg: string, options?: LogOptions): void
    error(msg: string, options?: LogErrorOptions): void
    clearScreen(type: LogType): void
    hasErrorLogged(error: Error | RollupError): boolean
    hasWarned: boolean
  }
  ```

Використовуйте користувацький логер для запису повідомлень. Ви можете використовувати API Vite `createLogger`, щоб отримати стандартний логер і налаштувати його, наприклад, змінити повідомлення або відфільтрувати певні попередження.

```ts twoslash
import { createLogger, defineConfig } from 'vite'

const logger = createLogger()
const loggerWarn = logger.warn

logger.warn = (msg, options) => {
  // Ігнорувати попередження про порожні CSS файли
  if (msg.includes('vite:css') && msg.includes(' is empty')) return
  loggerWarn(msg, options)
}

export default defineConfig({
  customLogger: logger,
})
```

## clearScreen

- **Тип:** `boolean`
- **За замовчуванням:** `true`

Встановіть в `false`, щоб запобігти очищенню екрану терміналу Vite при записі певних повідомлень. Через командний рядок використовуйте `--clearScreen false`.

## envDir

- **Тип:** `string`
- **За замовчуванням:** `root`

Директорія, з якої завантажуються `.env` файли. Може бути абсолютним шляхом або шляхом відносно кореня проекту.

Дивіться [тут](/guide/env-and-mode#env-files) для отримання додаткової інформації про файли середовища.

## envPrefix

- **Тип:** `string | string[]`
- **За замовчуванням:** `VITE_`

Змінні середовища, що починаються з `envPrefix`, будуть доступні у вашому клієнтському вихідному коді через import.meta.env.

:::warning ЗАУВАЖЕННЯ ЩОДО БЕЗПЕКИ
`envPrefix` не повинен бути встановлений як `''`, оскільки це зробить всі ваші змінні середовища доступними і може призвести до неочікуваного витоку конфіденційної інформації. Vite видасть помилку при виявленні `''`.

Якщо ви хочете зробити доступною змінну без префікса, ви можете використовувати [define](#define) для її експорту:

```js
define: {
  'import.meta.env.ENV_VARIABLE': JSON.stringify(process.env.ENV_VARIABLE)
}
```

:::

## appType

- **Тип:** `'spa' | 'mpa' | 'custom'`
- **За замовчуванням:** `'spa'`

Чи є ваш додаток односторінковим додатком (SPA), [багатосторінковим додатком (MPA)](../guide/build#multi-page-app) або користувацьким додатком (SSR та фреймворки з користувацькою обробкою HTML):

- `'spa'`: включає HTML middleware та використовує SPA fallback. Налаштуйте [sirv](https://github.com/lukeed/sirv) з `single: true` у режимі попереднього перегляду
- `'mpa'`: включає HTML middleware
- `'custom'`: не включає HTML middleware

Дізнайтеся більше у [керівництві по SSR](/guide/ssr#vite-cli). Пов'язано: [`server.middlewareMode`](./server-options#server-middlewaremode).

## future

- **Тип:** `Record<string, 'warn' | undefined>`
- **Пов'язано:** [Зміни, що ламають сумісність](/changes/)

Увімкніть майбутні зміни, що ламають сумісність, щоб підготуватися до плавної міграції на наступну основну версію Vite. Список може бути оновлений, доданий або видалений у будь-який час у міру розробки нових функцій.

Дивіться сторінку [Зміни, що ламають сумісність](/changes/) для деталей можливих опцій.
