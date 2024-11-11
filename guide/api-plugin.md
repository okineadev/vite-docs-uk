# API плагінів

Плагіни Vite розширюють добре спроектований інтерфейс плагінів Rollup з кількома додатковими опціями, специфічними для Vite. Як результат, ви можете написати плагін для Vite один раз і використовувати його як для розробки, так і для збірки.

**Рекомендується спочатку ознайомитися з [документацією плагінів Rollup](https://rollupjs.org/plugin-development/), перш ніж читати розділи нижче.**

## Створення плагіна

Vite прагне запропонувати встановлені шаблони з коробки, тому перед створенням нового плагіна переконайтеся, що ви перевірили [Посібник з функцій](https://vite.dev/guide/features), щоб дізнатися, чи покриває ваші потреби. Також перегляньте доступні плагіни спільноти, як у формі [сумісного плагіна Rollup](https://github.com/rollup/awesome), так і [специфічних плагінів Vite](https://github.com/vitejs/awesome-vite#plugins).

При створенні плагіна ви можете вбудувати його у ваш `vite.config.js`. Немає потреби створювати новий пакет для цього. Як тільки ви побачите, що плагін був корисним у ваших проектах, розгляньте можливість поділитися ним, щоб допомогти іншим [у екосистемі](https://chat.vite.dev).

::: порада
При вивченні, налагодженні або створенні плагінів ми рекомендуємо включити [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) у ваш проект. Це дозволяє вам перевіряти проміжний стан плагінів Vite. Після встановлення ви можете відвідати `localhost:5173/__inspect/`, щоб перевірити модулі та стек трансформацій вашого проекту. Ознайомтеся з інструкціями з встановлення у [документації vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect).
![vite-plugin-inspect](/images/vite-plugin-inspect.png)
:::

## Конвенції

Якщо плагін не використовує специфічні для Vite хуки і може бути реалізований як [сумісний плагін Rollup](#сумісність-з-плагінами-rollup), тоді рекомендується використовувати [конвенції іменування плагінів Rollup](https://rollupjs.org/plugin-development/#conventions).

- Плагіни Rollup повинні мати чітке ім'я з префіксом `rollup-plugin-`.
- Включіть ключові слова `rollup-plugin` і `vite-plugin` у package.json.

Це дозволяє використовувати плагін також у чистих проектах Rollup або WMR.

Для плагінів тільки для Vite:

- Плагіни Vite повинні мати чітке ім'я з префіксом `vite-plugin-`.
- Включіть ключове слово `vite-plugin` у package.json.
- Включіть розділ у документації плагіна, що пояснює, чому це плагін тільки для Vite (наприклад, він використовує специфічні для Vite хуки плагінів).

Якщо ваш плагін буде працювати тільки для певного фреймворку, його ім'я повинно бути включено як частина префіксу:

- Префікс `vite-plugin-vue-` для плагінів Vue
- Префікс `vite-plugin-react-` для плагінів React
- Префікс `vite-plugin-svelte-` для плагінів Svelte

Дивіться також [Конвенція віртуальних модулів](#конвенція-віртуальних-модулів).

## Конфігурація плагінів

Користувачі додаватимуть плагіни до проекту `devDependencies` і налаштовуватимуть їх за допомогою опції `plugins` масиву.

```js [vite.config.js]
import vitePlugin from 'vite-plugin-feature'
import rollupPlugin from 'rollup-plugin-feature'

export default defineConfig({
  plugins: [vitePlugin(), rollupPlugin()],
})
```

Неправдиві плагіни будуть ігноруватися, що можна використовувати для легкого активації або деактивації плагінів.

`plugins` також приймає пресети, що включають кілька плагінів як один елемент. Це корисно для складних функцій (наприклад, інтеграції фреймворку), які реалізуються за допомогою кількох плагінів. Масив буде внутрішньо розплющений.

```js
// framework-plugin
import frameworkRefresh from 'vite-plugin-framework-refresh'
import frameworkDevtools from 'vite-plugin-framework-devtools'

export default function framework(config) {
  return [frameworkRefresh(config), frameworkDevTools(config)]
}
```

```js [vite.config.js]
import { defineConfig } from 'vite'
import framework from 'vite-plugin-framework'

export default defineConfig({
  plugins: [framework()],
})
```

## Прості приклади

:::порада
Загальноприйнятою конвенцією є створення плагіна Vite/Rollup як фабричної функції, яка повертає фактичний об'єкт плагіна. Функція може приймати опції, що дозволяють користувачам налаштовувати поведінку плагіна.
:::

### Трансформація файлів з користувацькими розширеннями

```js
const fileRegex = /\.(my-file-ext)$/

export default function myPlugin() {
  return {
    name: 'transform-file',

    transform(src, id) {
      if (fileRegex.test(id)) {
        return {
          code: compileFileToJS(src),
          map: null, // надайте карту джерел, якщо доступна
        }
      }
    },
  }
}
```

### Імпорт віртуального файлу

Дивіться приклад у [наступному розділі](#конвенція-віртуальних-модулів).

## Конвенція віртуальних модулів

Віртуальні модулі - це корисна схема, яка дозволяє передавати інформацію часу збірки до вихідних файлів, використовуючи звичайний синтаксис імпорту ESM.

```js
export default function myPlugin() {
  const virtualModuleId = 'virtual:my-module'
  const resolvedVirtualModuleId = '\0' + virtualModuleId

  return {
    name: 'my-plugin', // обов'язково, буде відображатися у попередженнях та помилках
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    load(id) {
      if (id === resolvedVirtualModuleId) {
        return `export const msg = "from virtual module"`
      }
    },
  }
}
```

Що дозволяє імпортувати модуль у JavaScript:

```js
import { msg } from 'virtual:my-module'

console.log(msg)
```

Віртуальні модулі у Vite (та Rollup) зазвичай мають префікс `virtual:` для шляху, видимого користувачеві. Якщо можливо, слід використовувати ім'я плагіна як простір імен, щоб уникнути конфліктів з іншими плагінами в екосистемі. Наприклад, плагін `vite-plugin-posts` може попросити користувачів імпортувати віртуальні модулі `virtual:posts` або `virtual:posts/helpers`, щоб отримати інформацію часу збірки. Внутрішньо плагіни, що використовують віртуальні модулі, повинні префіксувати ідентифікатор модуля з `\0` під час вирішення ідентифікатора, що є конвенцією з екосистеми Rollup. Це запобігає спробам інших плагінів обробляти ідентифікатор (наприклад, резолюцію вузла), а основні функції, такі як карти джерел, можуть використовувати цю інформацію для розрізнення між віртуальними модулями та звичайними файлами. `\0` не є дозволеним символом у URL-адресах імпорту, тому ми повинні замінити їх під час аналізу імпорту. Віртуальний ідентифікатор `\0{id}` в кінцевому підсумку кодується як `/@id/__x00__{id}` під час розробки у браузері. Ідентифікатор буде декодовано назад перед входом у плагіни, тому це не видно у коді гачків плагінів.

Зверніть увагу, що модулі, безпосередньо отримані з реального файлу, як у випадку з модулем скрипта у компоненті одного файлу (наприклад, .vue або .svelte SFC), не потребують дотримання цієї конвенції. SFC зазвичай генерують набір підмодулів під час обробки, але код у них може бути відображений назад до файлової системи. Використання `\0` для цих підмодулів завадило б правильній роботі карт джерел.

## Універсальні хуки

Під час розробки сервер розробки Vite створює контейнер плагінів, який викликає [хуки збірки Rollup](https://rollupjs.org/plugin-development/#build-hooks) так само, як це робить Rollup.

Наступні хуки викликаються один раз при запуску сервера:

- [`options`](https://rollupjs.org/plugin-development/#options)
- [`buildStart`](https://rollupjs.org/plugin-development/#buildstart)

Наступні хуки викликаються при кожному запиті модуля:

- [`resolveId`](https://rollupjs.org/plugin-development/#resolveid)
- [`load`](https://rollupjs.org/plugin-development/#load)
- [`transform`](https://rollupjs.org/plugin-development/#transform)

Ці хуки також мають розширений параметр `options` з додатковими властивостями, специфічними для Vite. Ви можете дізнатися більше у [документації SSR](/guide/ssr#ssr-specific-plugin-logic).

Деякі виклики `resolveId` можуть мати значення `importer` як абсолютний шлях до загального `index.html` у корені, оскільки не завжди можливо визначити фактичний імпортер через небандловану схему сервера розробки Vite. Для імпортів, оброблених у межах резолюційного конвеєра Vite, імпортер може бути відстежений під час фази аналізу імпорту, надаючи правильне значення `importer`.

Наступні хуки викликаються при закритті сервера:

- [`buildEnd`](https://rollupjs.org/plugin-development/#buildend)
- [`closeBundle`](https://rollupjs.org/plugin-development/#closebundle)

Зверніть увагу, що хук [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed) **не** викликається під час розробки, оскільки Vite уникає повних AST аналізів для кращої продуктивності.

[Хуки генерації виходу](https://rollupjs.org/plugin-development/#output-generation-hooks) (крім `closeBundle`) **не** викликаються під час розробки. Ви можете уявити сервер розробки Vite як виклик `rollup.rollup()` без виклику `bundle.generate()`.

## Специфічні для Vite хуки

Плагіни Vite також можуть надавати хуки, які служать специфічним для Vite цілям. Ці хуки ігноруються Rollup.
### `config`

- **Тип:** `(config: UserConfig, env: { mode: string, command: string }) => UserConfig | null | void`
- **Вид:** `асинхронний`, `послідовний`

  Змінює конфігурацію Vite перед її остаточним налаштуванням. Хук отримує необроблену конфігурацію користувача (CLI опції, об'єднані з конфігураційним файлом) та поточне середовище конфігурації, яке містить `mode` та `command`, що використовуються. Він може повернути частковий об'єкт конфігурації, який буде глибоко об'єднаний з існуючою конфігурацією, або безпосередньо змінити конфігурацію (якщо стандартне об'єднання не може досягти бажаного результату).

  **Приклад:**

  ```js
  // повернення часткової конфігурації (рекомендується)
  const partialConfigPlugin = () => ({
    name: 'return-partial',
    config: () => ({
      resolve: {
        alias: {
          foo: 'bar',
        },
      },
    }),
  })

  // безпосередня зміна конфігурації (використовуйте лише коли об'єднання не працює)
  const mutateConfigPlugin = () => ({
    name: 'mutate-config',
    config(config, { command }) {
      if (command === 'build') {
        config.root = 'foo'
      }
    },
  })
  ```

  ::: warning Примітка
  Користувацькі плагіни вирішуються перед запуском цього хука, тому додавання інших плагінів всередині хука `config` не матиме ефекту.
  :::

### `configResolved`

- **Тип:** `(config: ResolvedConfig) => void | Promise<void>`
- **Вид:** `асинхронний`, `паралельний`

  Викликається після остаточного налаштування конфігурації Vite. Використовуйте цей хук для читання та збереження остаточної конфігурації. Він також корисний, коли плагін повинен виконувати різні дії залежно від команди, що виконується.

  **Приклад:**

  ```js
  const examplePlugin = () => {
    let config

    return {
      name: 'read-config',

      configResolved(resolvedConfig) {
        // зберігаємо остаточну конфігурацію
        config = resolvedConfig
      },

      // використовуємо збережену конфігурацію в інших хуках
      transform(code, id) {
        if (config.command === 'serve') {
          // dev: плагін викликається сервером розробки
        } else {
          // build: плагін викликається Rollup
        }
      },
    }
  }
  ```

  Зверніть увагу, що значення `command` є `serve` під час розробки (у CLI `vite`, `vite dev` та `vite serve` є синонімами).

### `configureServer`

- **Тип:** `(server: ViteDevServer) => (() => void) | void | Promise<(() => void) | void>`
- **Вид:** `асинхронний`, `послідовний`
- **Див. також:** [ViteDevServer](./api-javascript#vitedevserver)

  Хук для налаштування сервера розробки. Найбільш поширений випадок використання - додавання користувацьких проміжних програм до внутрішнього [connect](https://github.com/senchalabs/connect) додатку:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // користувацька обробка запиту...
      })
    },
  })
  ```

  **Вставка пост-проміжного програмного забезпечення**

  Хук `configureServer` викликається перед встановленням внутрішніх проміжних програм, тому користувацькі проміжні програми будуть виконуватися перед внутрішніми проміжними програмами за замовчуванням. Якщо ви хочете вставити проміжну програму **після** внутрішніх проміжних програм, ви можете повернути функцію з `configureServer`, яка буде викликана після встановлення внутрішніх проміжних програм:

  ```js
  const myPlugin = () => ({
    name: 'configure-server',
    configureServer(server) {
      // повертаємо пост-хук, який викликається після встановлення внутрішніх проміжних програм
      return () => {
        server.middlewares.use((req, res, next) => {
          // користувацька обробка запиту...
        })
      }
    },
  })
  ```

  **Зберігання доступу до сервера**

  У деяких випадках інші хуки плагінів можуть потребувати доступу до екземпляра сервера розробки (наприклад, доступ до веб-сокетного сервера, файлового системного спостерігача або графа модулів). Цей хук також можна використовувати для зберігання екземпляра сервера для доступу в інших хуках:

  ```js
  const myPlugin = () => {
    let server
    return {
      name: 'configure-server',
      configureServer(_server) {
        server = _server
      },
      transform(code, id) {
        if (server) {
          // використовуємо сервер...
        }
      },
    }
  }
  ```

  Зверніть увагу, що `configureServer` не викликається під час виконання виробничої збірки, тому ваші інші хуки повинні враховувати його відсутність.

### `configurePreviewServer`

- **Тип:** `(server: PreviewServer) => (() => void) | void | Promise<(() => void) | void>`
- **Вид:** `асинхронний`, `послідовний`
- **Див. також:** [PreviewServer](./api-javascript#previewserver)

  Те ж саме, що і [`configureServer`](/guide/api-plugin.html#configureserver), але для сервера попереднього перегляду. Подібно до `configureServer`, хук `configurePreviewServer` викликається перед встановленням інших проміжних програм. Якщо ви хочете вставити проміжну програму **після** інших проміжних програм, ви можете повернути функцію з `configurePreviewServer`, яка буде викликана після встановлення внутрішніх проміжних програм:

  ```js
  const myPlugin = () => ({
    name: 'configure-preview-server',
    configurePreviewServer(server) {
      // повертаємо пост-хук, який викликається після встановлення інших проміжних програм
      return () => {
        server.middlewares.use((req, res, next) => {
          // користувацька обробка запиту...
        })
      }
    },
  })
  ```

### `transformIndexHtml`

- **Тип:** `IndexHtmlTransformHook | { order?: 'pre' | 'post', handler: IndexHtmlTransformHook }`
- **Вид:** `асинхронний`, `послідовний`

  Присвячений хук для трансформації HTML файлів точки входу, таких як `index.html`. Хук отримує поточний HTML рядок та контекст трансформації. Контекст надає екземпляр [`ViteDevServer`](./api-javascript#vitedevserver) під час розробки та вихідний пакет Rollup під час збірки.

  Хук може бути асинхронним і може повернути одне з наступного:

  - Трансформований HTML рядок
  - Масив об'єктів дескрипторів тегів (`{ tag, attrs, children }`) для вставки в існуючий HTML. Кожен тег також може вказати, куди він повинен бути вставлений (за замовчуванням вставляється на початок `<head>`)
  - Об'єкт, що містить обидва як `{ html, tags }`

  За замовчуванням `order` є `undefined`, з цим хуком, застосованим після трансформації HTML. Для вставки скрипту, який повинен пройти через конвеєр плагінів Vite, `order: 'pre'` застосує хук перед обробкою HTML. `order: 'post'` застосовує хук після всіх хуків з `order` undefined.

  **Основний приклад:**

  ```js
  const htmlPlugin = () => {
    return {
      name: 'html-transform',
      transformIndexHtml(html) {
        return html.replace(
          /<title>(.*?)<\/title>/,
          `<title>Заголовок замінено!</title>`,
        )
      },
    }
  }
  ```

  **Повний підпис хука:**

  ```ts
  type IndexHtmlTransformHook = (
    html: string,
    ctx: {
      path: string
      filename: string
      server?: ViteDevServer
      bundle?: import('rollup').OutputBundle
      chunk?: import('rollup').OutputChunk
    },
  ) =>
    | IndexHtmlTransformResult
    | void
    | Promise<IndexHtmlTransformResult | void>

  type IndexHtmlTransformResult =
    | string
    | HtmlTagDescriptor[]
    | {
        html: string
        tags: HtmlTagDescriptor[]
      }

  interface HtmlTagDescriptor {
    tag: string
    attrs?: Record<string, string | boolean>
    children?: string | HtmlTagDescriptor[]
    /**
     * за замовчуванням: 'head-prepend'
     */
    injectTo?: 'head' | 'body' | 'head-prepend' | 'body-prepend'
  }
  ```

  ::: warning Примітка
  Цей хук не буде викликаний, якщо ви використовуєте фреймворк, який має власну обробку файлів точки входу (наприклад, [SvelteKit](https://github.com/sveltejs/kit/discussions/8269#discussioncomment-4509145)).
  :::

### `handleHotUpdate`

- **Тип:** `(ctx: HmrContext) => Array<ModuleNode> | void | Promise<Array<ModuleNode> | void>`
- **Див. також:** [HMR API](./api-hmr)

  Виконує користувацьку обробку оновлень HMR. Хук отримує об'єкт контексту з наступним підписом:

  ```ts
  interface HmrContext {
    file: string
    timestamp: number
    modules: Array<ModuleNode>
    read: () => string | Promise<string>
    server: ViteDevServer
  }
  ```

  - `modules` - це масив модулів, які постраждали від змін у файлі. Це масив, оскільки один файл може відповідати кільком сервісним модулям (наприклад, Vue SFC).

  - `read` - це асинхронна функція читання, яка повертає вміст файлу. Це надається, оскільки на деяких системах зворотний виклик зміни файлу може спрацювати занадто швидко до того, як редактор завершить оновлення файлу, і пряме `fs.readFile` поверне порожній вміст. Функція читання, що передається, нормалізує цю поведінку.

  Хук може вибрати:

  - Фільтрувати та звужувати список постраждалих модулів, щоб HMR був більш точним.

  - Повернути порожній масив і виконати повне перезавантаження:

    ```js
    handleHotUpdate({ server, modules, timestamp }) {
      // Ручне інвалідовання модулів
      const invalidatedModules = new Set()
      for (const mod of modules) {
        server.moduleGraph.invalidateModule(
          mod,
          invalidatedModules,
          timestamp,
          true
        )
      }
      server.ws.send({ type: 'full-reload' })
      return []
    }
    ```

  - Повернути порожній масив і виконати повну користувацьку обробку HMR, надсилаючи користувацькі події клієнту:

    ```js
    handleHotUpdate({ server }) {
      server.ws.send({
        type: 'custom',
        event: 'special-update',
        data: {}
      })
      return []
    }
    ```

    Код клієнта повинен зареєструвати відповідний обробник, використовуючи [HMR API](./api-hmr) (це може бути вставлено тим самим хуком `transform` плагіна):

    ```js
    if (import.meta.hot) {
      import.meta.hot.on('special-update', (data) => {
        // виконуємо користувацьке оновлення
      })
    }
    ```

## Порядок плагінів

Плагін Vite може додатково вказати властивість `enforce` (подібно до завантажувачів webpack), щоб налаштувати порядок його застосування. Значення `enforce` може бути або `"pre"`, або `"post"`. Вирішені плагіни будуть у наступному порядку:

- Alias
- Користувацькі плагіни з `enforce: 'pre'`
- Основні плагіни Vite
- Користувацькі плагіни без значення enforce
- Плагіни збірки Vite
- Користувацькі плагіни з `enforce: 'post'`
- Плагіни після збірки Vite (мінімізація, маніфест, звітування)

Зверніть увагу, що це окремо від порядку хуків, вони все ще окремо підпорядковуються своїй властивості `order` [як зазвичай для хуків Rollup](https://rollupjs.org/plugin-development/#build-hooks).

## Умовне застосування

За замовчуванням плагіни викликаються як для serve, так і для build. У випадках, коли плагін потрібно умовно застосовувати лише під час serve або build, використовуйте властивість `apply`, щоб викликати їх лише під час `'build'` або `'serve'`:

```js
function myPlugin() {
  return {
    name: 'build-only',
    apply: 'build', // або 'serve'
  }
}
```

Функцію також можна використовувати для більш точного контролю:

```js
apply(config, { command }) {
  // застосовувати лише під час build, але не для SSR
  return command === 'build' && !config.build.ssr
}
```

## Сумісність з плагінами Rollup

Досить багато плагінів Rollup працюватимуть безпосередньо як плагін Vite (наприклад, `@rollup/plugin-alias` або `@rollup/plugin-json`), але не всі, оскільки деякі хуки плагінів не мають сенсу в контексті небандлованого сервера розробки.

Загалом, якщо плагін Rollup відповідає наступним критеріям, то він повинен працювати як плагін Vite:

- Він не використовує хук [`moduleParsed`](https://rollupjs.org/plugin-development/#moduleparsed).
- Він не має сильної залежності між хуками фази збірки та хуками фази виводу.

Якщо плагін Rollup має сенс лише для фази збірки, то його можна вказати в `build.rollupOptions.plugins`. Він буде працювати так само, як плагін Vite з `enforce: 'post'` та `apply: 'build'`.

Ви також можете доповнити існуючий плагін Rollup властивостями, специфічними для Vite:

```js [vite.config.js]
import example from 'rollup-plugin-example'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...example(),
      enforce: 'post',
      apply: 'build',
    },
  ],
})
```

## Нормалізація шляхів

Vite нормалізує шляхи під час вирішення ідентифікаторів, використовуючи роздільники POSIX ( / ), зберігаючи при цьому том у Windows. З іншого боку, Rollup залишає вирішені шляхи незмінними за замовчуванням, тому вирішені ідентифікатори мають роздільники win32 ( \\ ) у Windows. Однак плагіни Rollup використовують внутрішньо [`normalizePath` утиліту](https://github.com/rollup/plugins/tree/master/packages/pluginutils#normalizepath) з `@rollup/pluginutils`, яка перетворює роздільники на POSIX перед виконанням порівнянь. Це означає, що коли ці плагіни використовуються у Vite, конфігураційні шаблони `include` та `exclude` та інші подібні шляхи проти порівнянь вирішених ідентифікаторів працюють правильно.

Отже, для плагінів Vite, при порівнянні шляхів з вирішеними ідентифікаторами важливо спочатку нормалізувати шляхи, використовуючи роздільники POSIX. Еквівалентна утиліта `normalizePath` експортується з модуля `vite`.

```js
import { normalizePath } from 'vite'

normalizePath('foo\\bar') // 'foo/bar'
normalizePath('foo/bar') // 'foo/bar'
```

## Фільтрація, шаблон include/exclude

Vite надає функцію [`createFilter` з `@rollup/pluginutils`](https://github.com/rollup/plugins/tree/master/packages/pluginutils#createfilter), щоб заохотити плагіни та інтеграції, специфічні для Vite, використовувати стандартний шаблон фільтрації include/exclude, який також використовується в самому Vite.

## Комунікація клієнт-сервер

З версії Vite 2.9 ми надаємо деякі утиліти для плагінів, щоб допомогти обробляти комунікацію з клієнтами.

### Сервер до Клієнта

На стороні плагіна ми можемо використовувати `server.ws.send` для трансляції подій клієнту:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('connection', () => {
          server.ws.send('my:greetings', { msg: 'hello' })
        })
      },
    },
  ],
})
```

::: порада
Ми рекомендуємо **завжди додавати префікс** до назв ваших подій, щоб уникнути конфліктів з іншими плагінами.
:::

На стороні клієнта використовуйте [`hot.on`](/guide/api-hmr.html#hot-on-event-cb) для прослуховування подій:

```ts twoslash
import 'vite/client'
// ---cut---
// client side
if (import.meta.hot) {
  import.meta.hot.on('my:greetings', (data) => {
    console.log(data.msg) // hello
  })
}
```

### Клієнт до Сервера

Щоб надсилати події з клієнта на сервер, ми можемо використовувати [`hot.send`](/guide/api-hmr.html#hot-send-event-payload):

```ts
// client side
if (import.meta.hot) {
  import.meta.hot.send('my:from-client', { msg: 'Hey!' })
}
```

Потім використовуйте `server.ws.on` і прослуховуйте події на стороні сервера:

```js [vite.config.js]
export default defineConfig({
  plugins: [
    {
      // ...
      configureServer(server) {
        server.ws.on('my:from-client', (data, client) => {
          console.log('Message from client:', data.msg) // Hey!
          // reply only to the client (if needed)
          client.send('my:ack', { msg: 'Hi! I got your message!' })
        })
      },
    },
  ],
})
```

### TypeScript для Користувацьких Подій

Внутрішньо, vite виводить тип корисного навантаження з інтерфейсу `CustomEventMap`, можливо типізувати користувацькі події, розширюючи цей інтерфейс:

:::порада
Переконайтеся, що включили розширення `.d.ts` при вказуванні файлів декларацій TypeScript. Інакше, TypeScript може не знати, який файл модуль намагається розширити.
:::

```ts [events.d.ts]
import 'vite/types/customEvent.d.ts'

declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
    // 'event-key': payload
  }
}
```

Це розширення інтерфейсу використовується `InferCustomEventPayload<T>` для виведення типу корисного навантаження для події `T`. Для отримання додаткової інформації про те, як використовується цей інтерфейс, зверніться до [Документації HMR API](./api-hmr#hmr-api).

```ts twoslash
import 'vite/client'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'
declare module 'vite/types/customEvent.d.ts' {
  interface CustomEventMap {
    'custom:foo': { msg: string }
  }
}
// ---cut---
type CustomFooPayload = InferCustomEventPayload<'custom:foo'>
import.meta.hot?.on('custom:foo', (payload) => {
  // The type of payload will be { msg: string }
})
import.meta.hot?.on('unknown:event', (payload) => {
  // The type of payload will be any
})
```
