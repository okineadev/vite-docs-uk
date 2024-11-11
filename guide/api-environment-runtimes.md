# API середовища для виконання

:::warning Експериментальний
Початкова робота над цим API була представлена у Vite 5.1 під назвою "Vite Runtime API". Цей посібник описує переглянутий API, перейменований на Environment API. Цей API буде випущений у Vite 6 як експериментальний. Ви вже можете протестувати його у останній версії `vite@6.0.0-beta.x`.

Ресурси:

- [Обговорення зворотного зв'язку](https://github.com/vitejs/vite/discussions/16358), де ми збираємо відгуки про нові API.
- [PR Environment API](https://github.com/vitejs/vite/pull/16471), де новий API був реалізований та переглянутий.

Будь ласка, поділіться з нами своїми відгуками, тестуючи цю пропозицію.
:::

## Фабрики середовищ

Фабрики середовищ призначені для реалізації постачальниками середовищ, такими як Cloudflare, а не кінцевими користувачами. Фабрики середовищ повертають `EnvironmentOptions` для найпоширенішого випадку використання цільового середовища як для розробки, так і для побудови. Також можна встановити параметри середовища за замовчуванням, щоб користувачеві не потрібно було це робити.

```ts
function createWorkerdEnvironment(
  userConfig: EnvironmentOptions,
): EnvironmentOptions {
  return mergeConfig(
    {
      resolve: {
        conditions: [
          /*...*/
        ],
      },
      dev: {
        createEnvironment(name, config) {
          return createWorkerdDevEnvironment(name, config, {
            hot: true,
            transport: customHotChannel(),
          })
        },
      },
      build: {
        createEnvironment(name, config) {
          return createWorkerdBuildEnvironment(name, config)
        },
      },
    },
    userConfig,
  )
}
```

Тоді файл конфігурації може бути написаний так:

```js
import { createWorkerdEnvironment } from 'vite-environment-workerd'

export default {
  environments: {
    ssr: createWorkerdEnvironment({
      build: {
        outDir: '/dist/ssr',
      },
    }),
    rsc: createWorkerdEnvironment({
      build: {
        outDir: '/dist/rsc',
      },
    }),
  },
}
```

і фреймворки можуть використовувати середовище з runtime workerd для виконання SSR за допомогою:

```js
const ssrEnvironment = server.environments.ssr
```

## Створення нової фабрики середовищ

Сервер розробки Vite за замовчуванням надає два середовища: середовище `client` та середовище `ssr`. Середовище клієнта за замовчуванням є браузерним середовищем, і виконавець модулів реалізується шляхом імпорту віртуального модуля `/@vite/client` у клієнтські додатки. Середовище SSR працює в тому ж середовищі Node, що і сервер Vite за замовчуванням, і дозволяє використовувати сервери додатків для обробки запитів під час розробки з повною підтримкою HMR.

Перетворений вихідний код називається модулем, і зв'язки між модулями, обробленими в кожному середовищі, зберігаються в графі модулів. Перетворений код для цих модулів надсилається в середовища, пов'язані з кожним середовищем, для виконання. Коли модуль оцінюється в середовищі виконання, його імпортовані модулі будуть запитуватися, що запускає обробку частини графа модулів.

Виконавець модулів Vite дозволяє виконувати будь-який код, попередньо обробляючи його за допомогою плагінів Vite. Це відрізняється від `server.ssrLoadModule`, оскільки реалізація виконавця відокремлена від сервера. Це дозволяє авторам бібліотек і фреймворків реалізовувати свій шар комунікації між сервером Vite і виконавцем. Браузер спілкується зі своїм відповідним середовищем за допомогою веб-сокета сервера та через HTTP-запити. Виконавець модулів Node може безпосередньо викликати функції для обробки модулів, оскільки він працює в тому ж процесі. Інші середовища можуть виконувати модулі, підключаючись до JS runtime, такого як workerd, або до Worker Thread, як це робить Vitest.

Однією з цілей цієї функції є надання настроюваного API для обробки та виконання коду. Користувачі можуть створювати нові фабрики середовищ, використовуючи надані примітиви.

```ts
import { DevEnvironment, HotChannel } from 'vite'

function createWorkerdDevEnvironment(
  name: string,
  config: ResolvedConfig,
  context: DevEnvironmentContext
) {
  const connection = /* ... */
  const transport: HotChannel = {
    on: (listener) => { connection.on('message', listener) },
    send: (data) => connection.send(data),
  }

  const workerdDevEnvironment = new DevEnvironment(name, config, {
    options: {
      resolve: { conditions: ['custom'] },
      ...context.options,
    },
    hot: true,
    transport,
  })
  return workerdDevEnvironment
}
```

## `ModuleRunner`

Виконавець модулів створюється в цільовому середовищі виконання. Усі API в наступному розділі імпортуються з `vite/module-runner`, якщо не зазначено інше. Ця точка входу експорту зберігається якомога легшою, експортуються лише мінімально необхідні для створення виконавців модулів.

**Тип підпису:**

```ts
export class ModuleRunner {
  constructor(
    public options: ModuleRunnerOptions,
    public evaluator: ModuleEvaluator,
    private debug?: ModuleRunnerDebugger,
  ) {}
  /**
   * URL для виконання.
   * Приймає шлях до файлу, шлях до сервера або id відносно кореня.
   */
  public async import<T = any>(url: string): Promise<T>
  /**
   * Очистити всі кеші, включаючи слухачів HMR.
   */
  public clearCache(): void
  /**
   * Очистити всі кеші, видалити всіх слухачів HMR, скинути підтримку sourcemap.
   * Цей метод не зупиняє з'єднання HMR.
   */
  public async close(): Promise<void>
  /**
   * Повертає `true`, якщо виконавець був закритий викликом `close()`.
   */
  public isClosed(): boolean
}
```

Оцінювач модулів у `ModuleRunner` відповідає за виконання коду. Vite експортує `ESModulesEvaluator` з коробки, він використовує `new AsyncFunction` для оцінки коду. Ви можете надати свою власну реалізацію, якщо ваш JavaScript runtime не підтримує небезпечну оцінку.

Виконавець модулів надає метод `import`. Коли сервер Vite запускає подію HMR `full-reload`, усі уражені модулі будуть повторно виконані. Зверніть увагу, що виконавець модулів не оновлює об'єкт `exports`, коли це відбувається (він його перезаписує), вам потрібно буде знову виконати `import` або отримати модуль з `evaluatedModules`, якщо ви покладаєтеся на наявність останнього об'єкта `exports`.

**Приклад використання:**

```js
import { ModuleRunner, ESModulesEvaluator } from 'vite/module-runner'
import { root, transport } from './rpc-implementation.js'

const moduleRunner = new ModuleRunner(
  {
    root,
    transport,
  },
  new ESModulesEvaluator(),
)

await moduleRunner.import('/src/entry-point.js')
```

## `ModuleRunnerOptions`

```ts
export interface ModuleRunnerOptions {
  /**
   * Корінь проекту
   */
  root: string
  /**
   * Набір методів для зв'язку з сервером.
   */
  transport: ModuleRunnerTransport
  /**
   * Налаштування способу вирішення sourcemap.
   * Віддає перевагу `node`, якщо доступний `process.setSourceMapsEnabled`.
   * В іншому випадку за замовчуванням буде використовувати `prepareStackTrace`, який перевизначає
   * метод `Error.prepareStackTrace`.
   * Ви можете надати об'єкт для налаштування способу вирішення вмісту файлів та
   * sourcemap для файлів, які не були оброблені Vite.
   */
  sourcemapInterceptor?:
    | false
    | 'node'
    | 'prepareStackTrace'
    | InterceptorOptions
  /**
   * Вимкнути HMR або налаштувати параметри HMR.
   */
  hmr?:
    | false
    | {
        /**
         * Налаштування логгера HMR.
         */
        logger?: false | HMRLogger
      }
  /**
   * Користувацький кеш модулів. Якщо не надано, створюється окремий кеш модулів
   * для кожного екземпляра виконавця модулів.
   */
  evaluatedModules?: EvaluatedModules
}
```

## `ModuleEvaluator`

**Тип підпису:**

```ts
export interface ModuleEvaluator {
  /**
   * Кількість префіксованих рядків у перетвореному коді.
   */
  startOffset?: number
  /**
   * Оцінити код, який був перетворений за допомогою Vite.
   * @param context Контекст функції
   * @param code Перетворений код
   * @param id Ідентифікатор, який використовувався для отримання модуля
   */
  runInlinedModule(
    context: ModuleRunnerContext,
    code: string,
    id: string,
  ): Promise<any>
  /**
   * Оцінити зовнішній модуль.
   * @param file URL файлу зовнішнього модуля
   */
  runExternalModule(file: string): Promise<any>
}
```

Vite експортує `ESModulesEvaluator`, який реалізує цей інтерфейс за замовчуванням. Він використовує `new AsyncFunction` для оцінки коду, тому якщо код містить вбудовану карту джерел, він повинен містити [зміщення на 2 рядки](https://tc39.es/ecma262/#sec-createdynamicfunction) для врахування нових рядків. Це робиться автоматично за допомогою `ESModulesEvaluator`. Користувацькі оцінювачі не додаватимуть додаткові рядки.

## `ModuleRunnerTransport`

**Тип підпису:**

```ts
interface ModuleRunnerTransport {
  connect?(handlers: ModuleRunnerTransportHandlers): Promise<void> | void
  disconnect?(): Promise<void> | void
  send?(data: HotPayload): Promise<void> | void
  invoke?(
    data: HotPayload,
  ): Promise<{ /** результат */ r: any } | { /** помилка */ e: any }>
  timeout?: number
}
```

Об'єкт транспорту, який спілкується з середовищем через RPC або безпосередньо викликаючи функцію. Коли метод `invoke` не реалізований, методи `send` та `connect` повинні бути реалізовані. Vite створить `invoke` внутрішньо.

Ви повинні поєднати його з екземпляром `HotChannel` на сервері, як у цьому прикладі, де виконавець модуля створюється в потоці робітника:

::: code-group

```js [worker.js]
import { parentPort } from 'node:worker_threads'
import { fileURLToPath } from 'node:url'
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

/** @type {import('vite/module-runner').ModuleRunnerTransport} */
const transport = {
  connect({ onMessage, onDisconnection }) {
    parentPort.on('message', onMessage)
    parentPort.on('close', onDisconnection)
  },
  send(data) {
    parentPort.postMessage(data)
  },
}

const runner = new ModuleRunner(
  {
    root: fileURLToPath(new URL('./', import.meta.url)),
    transport,
  },
  new ESModulesEvaluator(),
)
```

```js [server.js]
import { BroadcastChannel } from 'node:worker_threads'
import { createServer, RemoteEnvironmentTransport, DevEnvironment } from 'vite'

function createWorkerEnvironment(name, config, context) {
  const worker = new Worker('./worker.js')
  const handlerToWorkerListener = new WeakMap()

  const workerHotChannel = {
    send: (data) => w.postMessage(data),
    on: (event, handler) => {
      if (event === 'connection') return

      const listener = (value) => {
        if (value.type === 'custom' && value.event === event) {
          const client = {
            send(payload) {
              w.postMessage(payload)
            },
          }
          handler(value.data, client)
        }
      }
      handlerToWorkerListener.set(handler, listener)
      w.on('message', listener)
    },
    off: (event, handler) => {
      if (event === 'connection') return
      const listener = handlerToWorkerListener.get(handler)
      if (listener) {
        w.off('message', listener)
        handlerToWorkerListener.delete(handler)
      }
    },
  }

  return new DevEnvironment(name, config, {
    transport: workerHotChannel,
  })
}

await createServer({
  environments: {
    worker: {
      dev: {
        createEnvironment: createWorkerEnvironment,
      },
    },
  },
})
```

:::

Інший приклад використання HTTP-запиту для зв'язку між виконавцем і сервером:

```ts
import { ESModulesEvaluator, ModuleRunner } from 'vite/module-runner'

export const runner = new ModuleRunner(
  {
    root: fileURLToPath(new URL('./', import.meta.url)),
    transport: {
      async invoke(data) {
        const response = await fetch(`http://my-vite-server/invoke`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
        return response.json()
      },
    },
  },
  new ESModulesEvaluator(),
)

await runner.import('/entry.js')
```

У цьому випадку метод `handleInvoke` у `NormalizedHotChannel` може бути використаний:

```ts
const customEnvironment = new DevEnvironment(name, config, context)

server.onRequest((request: Request) => {
  const url = new URL(request.url)
  if (url.pathname === '/invoke') {
    const payload = (await request.json()) as HotPayload
    const result = customEnvironment.hot.handleInvoke(payload)
    return new Response(JSON.stringify(result))
  }
  return Response.error()
})
```

Але зверніть увагу, що для підтримки HMR потрібні методи `send` та `connect`. Метод `send` зазвичай викликається, коли тригериться користувацька подія (наприклад, `import.meta.hot.send("my-event")`).

Vite експортує `createServerHotChannel` з основної точки входу для підтримки HMR під час Vite SSR.
