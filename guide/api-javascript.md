# JavaScript API

JavaScript API Vite повністю типізовані, і рекомендується використовувати TypeScript або увімкнути перевірку типів у VS Code для використання інтелектуального введення та валідації.

## `createServer`

**Тип підпису:**

```ts
async function createServer(inlineConfig?: InlineConfig): Promise<ViteDevServer>
```

**Приклад використання:**

```ts twoslash
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const server = await createServer({
  // будь-які дійсні параметри конфігурації користувача, плюс `mode` та `configFile`
  configFile: false,
  root: __dirname,
  server: {
    port: 1337,
  },
})
await server.listen()

server.printUrls()
server.bindCLIShortcuts({ print: true })
```

::: tip ПРИМІТКА
При використанні `createServer` та `build` в одному процесі Node.js обидві функції покладаються на `process.env.NODE_ENV` для правильної роботи, що також залежить від параметра конфігурації `mode`. Щоб уникнути конфліктуючої поведінки, встановіть `process.env.NODE_ENV` або `mode` для обох API на `development`. В іншому випадку, ви можете створити дочірній процес для окремого запуску API.
:::

::: tip ПРИМІТКА
При використанні [режиму проміжного програмного забезпечення](/config/server-options.html#server-middlewaremode) у поєднанні з [проксі-конфігурацією для WebSocket](/config/server-options.html#server-proxy), батьківський http-сервер повинен бути наданий у `middlewareMode` для правильного зв'язування проксі.

<details>
<summary>Приклад</summary>

```ts twoslash
import http from 'http'
import { createServer } from 'vite'

const parentServer = http.createServer() // або express, koa тощо

const vite = await createServer({
  server: {
    // Увімкнути режим проміжного програмного забезпечення
    middlewareMode: {
      // Надати батьківський http-сервер для проксі WebSocket
      server: parentServer,
    },
    proxy: {
      '/ws': {
        target: 'ws://localhost:3000',
        // Проксіювання WebSocket
        ws: true,
      },
    },
  },
})

// @noErrors: 2339
parentServer.use(vite.middlewares)
```

</details>
:::

## `InlineConfig`

Інтерфейс `InlineConfig` розширює `UserConfig` з додатковими властивостями:

- `configFile`: вказати файл конфігурації для використання. Якщо не встановлено, Vite спробує автоматично знайти його з кореня проекту. Встановіть значення `false`, щоб вимкнути автоматичне визначення.
- `envFile`: Встановіть значення `false`, щоб вимкнути `.env` файли.

## `ResolvedConfig`

Інтерфейс `ResolvedConfig` має всі ті ж властивості, що й `UserConfig`, за винятком того, що більшість властивостей вирішені та не є невизначеними. Він також містить утиліти, такі як:

- `config.assetsInclude`: Функція для перевірки, чи вважається `id` активом.
- `config.logger`: Внутрішній об'єкт журналу Vite.

## `ViteDevServer`

```ts
interface ViteDevServer {
  /**
   * Вирішений об'єкт конфігурації Vite.
   */
  config: ResolvedConfig
  /**
   * Екземпляр програми connect
   * - Може бути використаний для додавання власних проміжних програм до dev-сервера.
   * - Також може бути використаний як функція обробника власного http-сервера
   *   або як проміжне програмне забезпечення в будь-яких фреймворках Node.js у стилі connect.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Власний екземпляр http-сервера Node.
   * Буде null у режимі проміжного програмного забезпечення.
   */
  httpServer: http.Server | null
  /**
   * Екземпляр спостерігача Chokidar. Якщо `config.server.watch` встановлено на `null`,
   * він не буде спостерігати за жодними файлами, і виклик `add` не матиме жодного ефекту.
   * https://github.com/paulmillr/chokidar#getting-started
   */
  watcher: FSWatcher
  /**
   * Сервер веб-сокетів з методом `send(payload)`.
   */
  ws: WebSocketServer
  /**
   * Контейнер плагінів Rollup, який може запускати хуки плагінів на даному файлі.
   */
  pluginContainer: PluginContainer
  /**
   * Граф модулів, який відстежує імпортні відносини, зіставлення URL з файлами
   * та стан hmr.
   */
  moduleGraph: ModuleGraph
  /**
   * Вирішені URL-адреси, які Vite друкує в CLI (URL-кодовані). Повертає `null`
   * у режимі проміжного програмного забезпечення або якщо сервер не слухає жодного порту.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Програмно вирішити, завантажити та трансформувати URL і отримати результат
   * без проходження через http-запит.
   */
  transformRequest(
    url: string,
    options?: TransformOptions,
  ): Promise<TransformResult | null>
  /**
   * Застосувати вбудовані HTML-трансформації Vite та будь-які плагінові HTML-трансформації.
   */
  transformIndexHtml(
    url: string,
    html: string,
    originalUrl?: string,
  ): Promise<string>
  /**
   * Завантажити даний URL як інстанційований модуль для SSR.
   */
  ssrLoadModule(
    url: string,
    options?: { fixStacktrace?: boolean },
  ): Promise<Record<string, any>>
  /**
   * Виправити стек-трейс помилки ssr.
   */
  ssrFixStacktrace(e: Error): void
  /**
   * Запускає HMR для модуля в графі модулів. Ви можете використовувати API `server.moduleGraph`
   * для отримання модуля, який потрібно перезавантажити. Якщо `hmr` встановлено на false, це не діє.
   */
  reloadModule(module: ModuleNode): Promise<void>
  /**
   * Запустити сервер.
   */
  listen(port?: number, isRestart?: boolean): Promise<ViteDevServer>
  /**
   * Перезапустити сервер.
   *
   * @param forceOptimize - примусово оптимізувати, те ж саме, що і прапор cli --force
   */
  restart(forceOptimize?: boolean): Promise<void>
  /**
   * Зупинити сервер.
   */
  close(): Promise<void>
  /**
   * Прив'язати комбінації клавіш CLI
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<ViteDevServer>): void
  /**
   * Виклик `await server.waitForRequestsIdle(id)` чекатиме, поки всі статичні імпорти
   * не будуть оброблені. Якщо викликати з хуків завантаження або трансформації плагінів, id потрібно
   * передати як параметр, щоб уникнути тупиків. Виклик цієї функції після того, як перший
   * розділ статичних імпортів графа модулів був оброблений, вирішиться негайно.
   * @experimental
   */
  waitForRequestsIdle: (ignoredId?: string) => Promise<void>
}
```

:::info
`waitForRequestsIdle` призначений для використання як вихід для покращення досвіду розробки для функцій, які не можуть бути реалізовані відповідно до природи на вимогу dev-сервера Vite. Його можна використовувати під час запуску такими інструментами, як Tailwind, щоб відкласти генерацію класів CSS додатка, поки код додатка не буде переглянутий, уникаючи спалахів змін стилів. Коли ця функція використовується в хуках завантаження або трансформації, і використовується сервер HTTP1 за замовчуванням, один із шести http-каналів буде заблокований, поки сервер обробляє всі статичні імпорти. Оптимізатор залежностей Vite наразі використовує цю функцію, щоб уникнути повного перезавантаження сторінки при відсутніх залежностях, затримуючи завантаження попередньо зібраних залежностей, поки всі імпортовані залежності не будуть зібрані з джерел статичних імпортів. Vite може перейти на іншу стратегію в майбутньому великому випуску, встановивши `optimizeDeps.crawlUntilStaticImports: false` за замовчуванням, щоб уникнути зниження продуктивності у великих додатках під час холодного запуску.
:::

## `build`

**Тип підпису:**

```ts
async function build(
  inlineConfig?: InlineConfig,
): Promise<RollupOutput | RollupOutput[]>
```

**Приклад використання:**

```ts twoslash [vite.config.js]
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

await build({
  root: path.resolve(__dirname, './project'),
  base: '/foo/',
  build: {
    rollupOptions: {
      // ...
    },
  },
})
```

## `preview`

**Тип підпису:**

```ts
async function preview(inlineConfig?: InlineConfig): Promise<PreviewServer>
```

**Приклад використання:**

```ts twoslash
import { preview } from 'vite'

const previewServer = await preview({
  // будь-які дійсні параметри конфігурації користувача, плюс `mode` та `configFile`
  preview: {
    port: 8080,
    open: true,
  },
})

previewServer.printUrls()
previewServer.bindCLIShortcuts({ print: true })
```

## `PreviewServer`

```ts
interface PreviewServer {
  /**
   * Вирішений об'єкт конфігурації Vite.
   */
  config: ResolvedConfig
  /**
   * Екземпляр програми connect
   * - Може бути використаний для додавання власних проміжних програм до preview-сервера.
   * - Також може бути використаний як функція обробника власного http-сервера
   *   або як проміжне програмне забезпечення в будь-яких фреймворках Node.js у стилі connect.
   *
   * https://github.com/senchalabs/connect#use-middleware
   */
  middlewares: Connect.Server
  /**
   * Власний екземпляр http-сервера Node.
   */
  httpServer: http.Server
  /**
   * Вирішені URL-адреси, які Vite друкує в CLI (URL-кодовані). Повертає `null`
   * якщо сервер не слухає жодного порту.
   */
  resolvedUrls: ResolvedServerUrls | null
  /**
   * Друк URL-адрес сервера
   */
  printUrls(): void
  /**
   * Прив'язати комбінації клавіш CLI
   */
  bindCLIShortcuts(options?: BindCLIShortcutsOptions<PreviewServer>): void
}
```

## `resolveConfig`

**Тип підпису:**

```ts
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development',
  defaultNodeEnv = 'development',
  isPreview = false,
): Promise<ResolvedConfig>
```

Значення `command` є `serve` у режимах розробки та попереднього перегляду, і `build` у режимі збірки.

## `mergeConfig`

**Тип підпису:**

```ts
function mergeConfig(
  defaults: Record<string, any>,
  overrides: Record<string, any>,
  isRoot = true,
): Record<string, any>
```

Глибоке злиття двох конфігурацій Vite. `isRoot` представляє рівень у конфігурації Vite, який зливається. Наприклад, встановіть значення `false`, якщо ви зливаєте дві опції `build`.

::: tip ПРИМІТКА
`mergeConfig` приймає лише конфігурацію у вигляді об'єкта. Якщо у вас є конфігурація у вигляді зворотного виклику, ви повинні викликати її перед передачею в `mergeConfig`.

Ви можете використовувати хелпер `defineConfig`, щоб з'єднати конфігурацію у вигляді зворотного виклику з іншою конфігурацією:

```ts twoslash
import {
  defineConfig,
  mergeConfig,
  type UserConfigFnObject,
  type UserConfig,
} from 'vite'
declare const configAsCallback: UserConfigFnObject
declare const configAsObject: UserConfig

// ---cut---
export default defineConfig((configEnv) =>
  mergeConfig(configAsCallback(configEnv), configAsObject),
)
```

:::

## `searchForWorkspaceRoot`

**Тип підпису:**

```ts
function searchForWorkspaceRoot(
  current: string,
  root = searchForPackageRoot(current),
): string
```

**Пов'язано:** [server.fs.allow](/config/server-options.md#server-fs-allow)

Пошук кореня потенційного робочого простору, якщо він відповідає наступним умовам, інакше буде повернуто `root`:

- містить поле `workspaces` у `package.json`
- містить один з наступних файлів
  - `lerna.json`
  - `pnpm-workspace.yaml`

## `loadEnv`

**Тип підпису:**

```ts
function loadEnv(
  mode: string,
  envDir: string,
  prefixes: string | string[] = 'VITE_',
): Record<string, string>
```

**Пов'язано:** [`.env` Файли](./env-and-mode.md#env-files)

Завантаження `.env` файлів у межах `envDir`. За замовчуванням, завантажуються лише змінні середовища з префіксом `VITE_`, якщо `prefixes` не змінено.

## `normalizePath`

**Тип підпису:**

```ts
function normalizePath(id: string): string
```

**Пов'язано:** [Нормалізація Шляхів](./api-plugin.md#path-normalization)

Нормалізує шлях для взаємодії між плагінами Vite.

## `transformWithEsbuild`

**Тип підпису:**

```ts
async function transformWithEsbuild(
  code: string,
  filename: string,
  options?: EsbuildTransformOptions,
  inMap?: object,
): Promise<ESBuildTransformResult>
```

Трансформування JavaScript або TypeScript за допомогою esbuild. Корисно для плагінів, які віддають перевагу відповідності внутрішній трансформації esbuild у Vite.

## `loadConfigFromFile`

**Тип підпису:**

```ts
async function loadConfigFromFile(
  configEnv: ConfigEnv,
  configFile?: string,
  configRoot: string = process.cwd(),
  logLevel?: LogLevel,
  customLogger?: Logger,
): Promise<{
  path: string
  config: UserConfig
  dependencies: string[]
} | null>
```

Завантаження конфігураційного файлу Vite вручну за допомогою esbuild.

## `preprocessCSS`

- **Експериментально:** [Залишити відгук](https://github.com/vitejs/vite/discussions/13815)

**Тип підпису:**

```ts
async function preprocessCSS(
  code: string,
  filename: string,
  config: ResolvedConfig,
): Promise<PreprocessCSSResult>

interface PreprocessCSSResult {
  code: string
  map?: SourceMapInput
  modules?: Record<string, string>
  deps?: Set<string>
}
```

Попередня обробка файлів `.css`, `.scss`, `.sass`, `.less`, `.styl` та `.stylus` до звичайного CSS, щоб їх можна було використовувати в браузерах або аналізувати іншими інструментами. Подібно до [вбудованої підтримки попередньої обробки CSS](/guide/features#css-pre-processors), відповідний попередній процесор повинен бути встановлений, якщо використовується.

Попередній процесор визначається за розширенням `filename`. Якщо `filename` закінчується на `.module.{ext}`, він визначається як [CSS модуль](https://github.com/css-modules/css-modules), і повернутий результат включатиме об'єкт `modules`, що відображає оригінальні імена класів у трансформовані.

Зверніть увагу, що попередня обробка не буде вирішувати URL-адреси в `url()` або `image-set()`.
