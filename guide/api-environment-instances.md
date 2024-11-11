# Використання екземплярів `Environment`

:::warning Експериментально
Початкова робота над цим API була представлена у Vite 5.1 під назвою "Vite Runtime API". Цей посібник описує переглянуте API, перейменоване на Environment API. Це API буде випущено у Vite 6 як експериментальне. Ви вже можете протестувати його у останній версії `vite@6.0.0-beta.x`.

Ресурси:

- [Обговорення зворотного зв'язку](https://github.com/vitejs/vite/discussions/16358), де ми збираємо відгуки про нові API.
- [PR Environment API](https://github.com/vitejs/vite/pull/16471), де нове API було реалізовано та переглянуто.

Будь ласка, поділіться з нами своїми відгуками, тестуючи цю пропозицію.
:::

## Доступ до середовищ

Під час розробки доступні середовища у dev-сервері можна отримати за допомогою `server.environments`:

```js
// створіть сервер або отримайте його з хука configureServer
const server = await createServer(/* options */)

const environment = server.environments.client
environment.transformRequest(url)
console.log(server.environments.ssr.moduleGraph)
```

Ви також можете отримати доступ до поточного середовища з плагінів. Дивіться [Environment API для плагінів](./api-environment-plugins.md#accessing-the-current-environment-in-hooks) для отримання додаткової інформації.

## Клас `DevEnvironment`

Під час розробки кожне середовище є екземпляром класу `DevEnvironment`:

```ts
class DevEnvironment {
  /**
   * Унікальний ідентифікатор для середовища у Vite сервері.
   * За замовчуванням Vite надає 'client' та 'ssr' середовища.
   */
  name: string
  /**
   * Канал зв'язку для надсилання та отримання повідомлень від
   * пов'язаного модуля у цільовому середовищі виконання.
   */
  hot: NormalizedHotChannel
  /**
   * Граф модулів, з відношенням імпорту між
   * обробленими модулями та кешованим результатом обробленого коду.
   */
  moduleGraph: EnvironmentModuleGraph
  /**
   * Вирішені плагіни для цього середовища, включаючи ті,
   * що створені за допомогою хука `create` для кожного середовища
   */
  plugins: Plugin[]
  /**
   * Дозволяє вирішувати, завантажувати та трансформувати код через
   * конвеєр плагінів середовища
   */
  pluginContainer: EnvironmentPluginContainer
  /**
   * Вирішені параметри конфігурації для цього середовища. Параметри на
   * глобальному рівні сервера беруться як значення за замовчуванням для всіх середовищ і можуть
   * бути перевизначені (умови вирішення, зовнішні, оптимізовані залежності)
   */
  config: ResolvedConfig & ResolvedDevEnvironmentOptions

  constructor(name, config, { hot, options }: DevEnvironmentSetup)

  /**
   * Вирішує URL до id, завантажує його та обробляє код за допомогою
   * конвеєра плагінів. Граф модулів також оновлюється.
   */
  async transformRequest(url: string): TransformResult

  /**
   * Реєструє запит для обробки з низьким пріоритетом. Це корисно
   * для уникнення водоспадів. Vite сервер має інформацію про
   * імпортовані модулі іншими запитами, тому він може прогріти граф модулів,
   * щоб модулі вже були оброблені, коли вони запитуються.
   */
  async warmupRequest(url: string): void
}
```

З `TransformResult`:

```ts
interface TransformResult {
  code: string
  map: SourceMap | { mappings: '' } | null
  etag?: string
  deps?: string[]
  dynamicDeps?: string[]
}
```

Екземпляр середовища у Vite сервері дозволяє обробляти URL за допомогою методу `environment.transformRequest(url)`. Ця функція використовує конвеєр плагінів для вирішення `url` до модуля `id`, завантажує його (читаючи файл з файлової системи або через плагін, що реалізує віртуальний модуль), а потім трансформує код. Під час трансформації модуля імпорти та інші метадані будуть записані у граф модуля середовища шляхом створення або оновлення відповідного вузла модуля. Після завершення обробки результат трансформації також зберігається у модулі.

:::info назва transformRequest
Ми використовуємо `transformRequest(url)` та `warmupRequest(url)` у поточній версії цієї пропозиції, щоб користувачам, які звикли до поточного API Vite, було легше обговорювати та розуміти. Перед випуском ми можемо скористатися можливістю переглянути ці назви. Наприклад, це може бути названо `environment.processModule(url)` або `environment.loadModule(url)`, взявши приклад з `context.load(id)` у хуках плагінів Rollup. На даний момент ми вважаємо, що краще зберегти поточні назви та відкласти це обговорення.
:::

## Окремі графи модулів

Кожне середовище має ізольований граф модулів. Усі графи модулів мають однаковий підпис, тому можна реалізувати загальні алгоритми для обходу або запиту графа без залежності від середовища. `hotUpdate` є гарним прикладом. Коли файл змінюється, граф модуля кожного середовища буде використовуватися для виявлення уражених модулів та виконання HMR для кожного середовища незалежно.

::: info
Vite v5 мав змішаний граф модулів для клієнта та SSR. Враховуючи необроблений або недійсний вузол, неможливо визначити, чи відповідає він клієнту, SSR або обом середовищам. Вузли модулів мають деякі властивості з префіксами, такі як `clientImportedModules` та `ssrImportedModules` (та `importedModules`, що повертає об'єднання обох). `importers` містить усіх імпортерів з обох середовищ клієнта та SSR для кожного вузла модуля. Вузол модуля також має `transformResult` та `ssrTransformResult`. Шар зворотної сумісності дозволяє екосистемі мігрувати від застарілого `server.moduleGraph`.
:::

Кожен модуль представлений екземпляром `EnvironmentModuleNode`. Модулі можуть бути зареєстровані у графі без обробки (`transformResult` буде `null` у такому випадку). `importers` та `importedModules` також оновлюються після обробки модуля.

```ts
class EnvironmentModuleNode {
  environment: string

  url: string
  id: string | null = null
  file: string | null = null

  type: 'js' | 'css'

  importers = new Set<EnvironmentModuleNode>()
  importedModules = new Set<EnvironmentModuleNode>()
  importedBindings: Map<string, Set<string>> | null = null

  info?: ModuleInfo
  meta?: Record<string, any>
  transformResult: TransformResult | null = null

  acceptedHmrDeps = new Set<EnvironmentModuleNode>()
  acceptedHmrExports: Set<string> | null = null
  isSelfAccepting?: boolean
  lastHMRTimestamp = 0
  lastInvalidationTimestamp = 0
}
```

`environment.moduleGraph` є екземпляром `EnvironmentModuleGraph`:

```ts
export class EnvironmentModuleGraph {
  environment: string

  urlToModuleMap = new Map<string, EnvironmentModuleNode>()
  idToModuleMap = new Map<string, EnvironmentModuleNode>()
  etagToModuleMap = new Map<string, EnvironmentModuleNode>()
  fileToModulesMap = new Map<string, Set<EnvironmentModuleNode>>()

  constructor(
    environment: string,
    resolveId: (url: string) => Promise<PartialResolvedId | null>,
  )

  async getModuleByUrl(
    rawUrl: string,
  ): Promise<EnvironmentModuleNode | undefined>

  getModulesByFile(file: string): Set<EnvironmentModuleNode> | undefined

  onFileChange(file: string): void

  invalidateModule(
    mod: EnvironmentModuleNode,
    seen: Set<EnvironmentModuleNode> = new Set(),
    timestamp: number = Date.now(),
    isHmr: boolean = false,
  ): void

  invalidateAll(): void

  async ensureEntryFromUrl(
    rawUrl: string,
    setIsSelfAccepting = true,
  ): Promise<EnvironmentModuleNode>

  createFileOnlyEntry(file: string): EnvironmentModuleNode

  async resolveUrl(url: string): Promise<ResolvedUrl>

  updateModuleTransformResult(
    mod: EnvironmentModuleNode,
    result: TransformResult | null,
  ): void

  getModuleByEtag(etag: string): EnvironmentModuleNode | undefined
}
```
