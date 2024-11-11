# API середовища для фреймворків

:::warning Експериментальний
Початкова робота над цим API була представлена у Vite 5.1 під назвою "Vite Runtime API". Цей посібник описує переглянуте API, перейменоване на Environment API. Це API буде випущено у Vite 6 як експериментальне. Ви вже можете протестувати його у останній версії `vite@6.0.0-beta.x`.

Ресурси:

- [Обговорення зворотного зв'язку](https://github.com/vitejs/vite/discussions/16358), де ми збираємо відгуки про нові API.
- [PR Environment API](https://github.com/vitejs/vite/pull/16471), де нове API було реалізовано та переглянуто.

Будь ласка, поділіться з нами своїми відгуками, тестуючи пропозицію.
:::

## Середовища та фреймворки

Неявне середовище `ssr` та інші не-клієнтські середовища використовують `RunnableDevEnvironment` за замовчуванням під час розробки. Хоча це вимагає, щоб середовище виконання було таким самим, як і те, в якому працює сервер Vite, це працює аналогічно з `ssrLoadModule` і дозволяє фреймворкам мігрувати та вмикати HMR для своєї історії розробки SSR. Ви можете захистити будь-яке середовище, що виконується, за допомогою функції `isRunnableDevEnvironment`.

```ts
export class RunnableDevEnvironment extends DevEnvironment {
  public readonly runner: ModuleRunner
}

class ModuleRunner {
  /**
   * URL для виконання.
   * Приймає шлях до файлу, шлях до сервера або id відносно кореня.
   * Повертає інстанційований модуль (так само, як у ssrLoadModule)
   */
  public async import(url: string): Promise<Record<string, any>>
  /**
   * Інші методи ModuleRunner...
   */
}

if (isRunnableDevEnvironment(server.environments.ssr)) {
  await server.environments.ssr.runner.import('/entry-point.js')
}
```

:::warning
`runner` оцінюється негайно, коли до нього звертаються вперше. Зверніть увагу, що Vite вмикає підтримку мап джерел, коли `runner` створюється шляхом виклику `process.setSourceMapsEnabled` або шляхом перевизначення `Error.prepareStackTrace`, якщо він недоступний.
:::

## За замовчуванням `RunnableDevEnvironment`

Маючи сервер Vite, налаштований у режимі проміжного програмного забезпечення, як описано в [посібнику з налаштування SSR](/guide/ssr#setting-up-the-dev-server), давайте реалізуємо проміжне програмне забезпечення SSR за допомогою API середовища. Обробка помилок опущена.

```js
import { createServer } from 'vite'

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  environments: {
    server: {
      // за замовчуванням модулі виконуються в тому ж процесі, що й сервер vite
    },
  },
})

// Можливо, вам доведеться привести це до RunnableDevEnvironment у TypeScript або
// використовувати isRunnableDevEnvironment для захисту доступу до runner
const environment = server.environments.node

app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  // 1. Прочитайте index.html
  const indexHtmlPath = path.resolve(__dirname, 'index.html')
  let template = fs.readFileSync(indexHtmlPath, 'utf-8')

  // 2. Застосуйте перетворення HTML Vite. Це впроваджує клієнт Vite HMR,
  //    а також застосовує перетворення HTML від плагінів Vite, наприклад, глобальні
  //    преамбули з @vitejs/plugin-react
  template = await server.transformIndexHtml(url, template)

  // 3. Завантажте серверний вхід. import(url) автоматично перетворює
  //    вихідний код ESM для використання в Node.js! Не потрібно жодного бандлінгу,
  //    і забезпечує повну підтримку HMR.
  const { render } = await environment.runner.import('/src/entry-server.js')

  // 4. Відрендерте HTML додатку. Це передбачає, що експортована
  //     функція `render` у entry-server.js викликає відповідні API SSR фреймворку,
  //    наприклад, ReactDOMServer.renderToString()
  const appHtml = await render(url)

  // 5. Вставте відрендерений HTML додатку в шаблон.
  const html = template.replace(`<!--ssr-outlet-->`, appHtml)

  // 6. Надішліть відрендерений HTML назад.
  res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
})
```

## Runtime агностичний SSR

Оскільки `RunnableDevEnvironment` можна використовувати лише для виконання коду в тому ж середовищі виконання, що й сервер Vite, це вимагає середовища виконання, яке може запускати сервер Vite (середовище виконання, сумісне з Node.js). Це означає, що вам потрібно буде використовувати сирий `DevEnvironment`, щоб зробити його незалежним від середовища виконання.

:::info Пропозиція `FetchableDevEnvironment`

Початкова пропозиція мала метод `run` у класі `DevEnvironment`, який дозволяв споживачам викликати імпорт на стороні runner за допомогою опції `transport`. Під час нашого тестування ми виявили, що API не є достатньо універсальним, щоб почати його рекомендувати. На даний момент ми шукаємо відгуки про [пропозицію `FetchableDevEnvironment`](https://github.com/vitejs/vite/discussions/18191).

:::

`RunnableDevEnvironment` має функцію `runner.import`, яка повертає значення модуля. Але ця функція недоступна в сирому `DevEnvironment` і вимагає, щоб код, який використовує API Vite, і модулі користувача були роз'єднані.

Наприклад, у наступному прикладі використовується значення модуля користувача з коду, який використовує API Vite:

```ts
// код, що використовує API Vite
import { createServer } from 'vite'

const server = createServer()
const ssrEnvironment = server.environment.ssr
const input = {}

const { createHandler } = await ssrEnvironment.runner.import('./entry.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Якщо ваш код може працювати в тому ж середовищі виконання, що й модулі користувача (тобто він не залежить від специфічних для Node.js API), ви можете використовувати віртуальний модуль. Цей підхід усуває необхідність доступу до значення з коду, що використовує API Vite.

```ts
// код, що використовує API Vite
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // плагін, який обробляє `virtual:entrypoint`
    {
      name: 'virtual-module',
      /* реалізація плагіна */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// використовуйте функції, що надаються кожним середовищем, яке запускає код
// перевірте, що надає кожне середовище
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Непідтримуване середовище виконання для ${ssrEnvironment.name}`)
}

// -------------------------------------
// virtual:entrypoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)
const response = handler(new Request('/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

Наприклад, щоб викликати `transformIndexHtml` на модулі користувача, можна використовувати наступний плагін:

```ts {13-21}
function vitePluginVirtualIndexHtml(): Plugin {
  let server: ViteDevServer | undefined
  return {
    name: vitePluginVirtualIndexHtml.name,
    configureServer(server_) {
      server = server_
    },
    resolveId(source) {
      return source === 'virtual:index-html' ? '\0' + source : undefined
    },
    async load(id) {
      if (id === '\0' + 'virtual:index-html') {
        let html: string
        if (server) {
          this.addWatchFile('index.html')
          html = fs.readFileSync('index.html', 'utf-8')
          html = await server.transformIndexHtml('/', html)
        } else {
          html = fs.readFileSync('dist/client/index.html', 'utf-8')
        }
        return `export default ${JSON.stringify(html)}`
      }
      return
    },
  }
}
```

Якщо ваш код вимагає API Node.js, ви можете використовувати `hot.send`, щоб спілкуватися з кодом, який використовує API Vite з модулів користувача. Однак майте на увазі, що цей підхід може не працювати однаково після процесу збірки.

```ts
// код, що використовує API Vite
import { createServer } from 'vite'

const server = createServer({
  plugins: [
    // плагін, який обробляє `virtual:entrypoint`
    {
      name: 'virtual-module',
      /* реалізація плагіна */
    },
  ],
})
const ssrEnvironment = server.environment.ssr
const input = {}

// використовуйте функції, що надаються кожним середовищем, яке запускає код
// перевірте, що надає кожне середовище
if (ssrEnvironment instanceof RunnableDevEnvironment) {
  ssrEnvironment.runner.import('virtual:entrypoint')
} else if (ssrEnvironment instanceof CustomDevEnvironment) {
  ssrEnvironment.runEntrypoint('virtual:entrypoint')
} else {
  throw new Error(`Непідтримуване середовище виконання для ${ssrEnvironment.name}`)
}

const req = new Request('/')

const uniqueId = 'a-unique-id'
ssrEnvironment.send('request', serialize({ req, uniqueId }))
const response = await new Promise((resolve) => {
  ssrEnvironment.on('response', (data) => {
    data = deserialize(data)
    if (data.uniqueId === uniqueId) {
      resolve(data.res)
    }
  })
})

// -------------------------------------
// virtual:entrypoint
const { createHandler } = await import('./entrypoint.js')
const handler = createHandler(input)

import.meta.hot.on('request', (data) => {
  const { req, uniqueId } = deserialize(data)
  const res = handler(req)
  import.meta.hot.send('response', serialize({ res: res, uniqueId }))
})

const response = handler(new Request('/'))

// -------------------------------------
// ./entrypoint.js
export function createHandler(input) {
  return function handler(req) {
    return new Response('hello')
  }
}
```

## Середовища під час збірки

У CLI виклик `vite build` і `vite build --ssr` все ще буде збирати лише клієнтські та лише ssr середовища для зворотної сумісності.

Коли `builder` не є `undefined` (або при виклику `vite build --app`), `vite build` перейде до збірки всього додатку замість цього. Це пізніше стане стандартом у майбутньому мажорному випуску. Буде створено екземпляр `ViteBuilder` (еквівалентний `ViteDevServer` під час збірки), щоб зібрати всі налаштовані середовища для виробництва. За замовчуванням збірка середовищ виконується послідовно, дотримуючись порядку запису `environments`. Фреймворк або користувач можуть додатково налаштувати, як збираються середовища, використовуючи:

```js
export default {
  builder: {
    buildApp: async (builder) => {
      const environments = Object.values(builder.environments)
      return Promise.all(
        environments.map((environment) => builder.build(environment)),
      )
    },
  },
}
```

## Код, незалежний від середовища

Більшість часу поточний екземпляр `environment` буде доступний як частина контексту коду, що виконується, тому потреба доступу до них через `server.environments` має бути рідкістю. Наприклад, всередині хуків плагінів середовище викривається як частина `PluginContext`, тому до нього можна отримати доступ за допомогою `this.environment`. Дивіться [API середовища для плагінів](./api-environment-plugins.md), щоб дізнатися, як створювати плагіни, що враховують середовище.
