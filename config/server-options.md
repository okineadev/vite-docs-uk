# Опції сервера

Якщо не зазначено інше, опції в цьому розділі застосовуються лише до розробки.

## server.host

- **Тип:** `string | boolean`
- **За замовчуванням:** `'localhost'`

Вкажіть, на яких IP-адресах сервер повинен слухати.
Встановіть це значення на `0.0.0.0` або `true`, щоб слухати на всіх адресах, включаючи локальні та публічні адреси.

Це можна встановити через CLI, використовуючи `--host 0.0.0.0` або `--host`.

::: tip ПРИМІТКА

Є випадки, коли інші сервери можуть відповідати замість Vite.

Перший випадок - коли використовується `localhost`. Node.js версії нижче 17 за замовчуванням змінює порядок результатів DNS-резольвінгу адрес. При доступі до `localhost` браузери використовують DNS для резольвінгу адреси, і ця адреса може відрізнятися від тієї, на якій слухає Vite. Vite виводить резольвовану адресу, коли вона відрізняється.

Ви можете встановити [`dns.setDefaultResultOrder('verbatim')`](https://nodejs.org/api/dns.html#dns_dns_setdefaultresultorder_order), щоб вимкнути поведінку зміни порядку. Vite тоді виведе адресу як `localhost`.

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'
import dns from 'node:dns'

dns.setDefaultResultOrder('verbatim')

export default defineConfig({
  // omit
})
```

Другий випадок - коли використовуються хости з підстановочними знаками (наприклад, `0.0.0.0`). Це тому, що сервери, які слухають на не підстановочних хостах, мають пріоритет над тими, що слухають на підстановочних хостах.

:::

::: tip Доступ до сервера на WSL2 з вашої локальної мережі

При запуску Vite на WSL2 недостатньо встановити `host: true`, щоб отримати доступ до сервера з вашої локальної мережі.
Дивіться [документ WSL](https://learn.microsoft.com/en-us/windows/wsl/networking#accessing-a-wsl-2-distribution-from-your-local-area-network-lan) для отримання додаткової інформації.

:::

## server.port

- **Тип:** `number`
- **За замовчуванням:** `5173`

Вкажіть порт сервера. Зверніть увагу, якщо порт вже використовується, Vite автоматично спробує наступний доступний порт, тому це може бути не той порт, на якому сервер в кінцевому підсумку слухає.

## server.strictPort

- **Тип:** `boolean`

Встановіть значення `true`, щоб вийти, якщо порт вже використовується, замість автоматичної спроби наступного доступного порту.

## server.https

- **Тип:** `https.ServerOptions`

Увімкніть TLS + HTTP/2. Зверніть увагу, що це знижується до TLS тільки при використанні опції [`server.proxy`](#serverproxy).

Значення також може бути [об'єктом опцій](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener), переданим до `https.createServer()`.

Потрібен дійсний сертифікат. Для базового налаштування ви можете додати [@vitejs/plugin-basic-ssl](https://github.com/vitejs/vite-plugin-basic-ssl) до плагінів проекту, який автоматично створить і кешує самопідписаний сертифікат. Але ми рекомендуємо створити власні сертифікати.

## server.open

- **Тип:** `boolean | string`

Автоматично відкривайте додаток у браузері при запуску сервера. Коли значення є рядком, воно буде використовуватися як шлях URL. Якщо ви хочете відкрити сервер у певному браузері, який вам подобається, ви можете встановити змінну середовища `process.env.BROWSER` (наприклад, `firefox`). Ви також можете встановити `process.env.BROWSER_ARGS`, щоб передати додаткові аргументи (наприклад, `--incognito`).

`BROWSER` і `BROWSER_ARGS` також є спеціальними змінними середовища, які ви можете встановити у файлі `.env` для налаштування. Дивіться [пакет `open`](https://github.com/sindresorhus/open#app) для отримання додаткової інформації.

**Приклад:**

```js
export default defineConfig({
  server: {
    open: '/docs/index.html',
  },
})
```

## server.proxy

- **Тип:** `Record<string, string | ProxyOptions>`

Налаштуйте власні правила проксі для сервера розробки. Очікується об'єкт пар `{ ключ: опції }`. Будь-які запити, шлях яких починається з цього ключа, будуть проксійовані до вказаного цільового сервера. Якщо ключ починається з `^`, він буде інтерпретований як `RegExp`. Опція `configure` може бути використана для доступу до екземпляра проксі. Якщо запит відповідає будь-якому з налаштованих правил проксі, запит не буде трансформований Vite.

Зверніть увагу, що якщо ви використовуєте не відносний [`base`](/config/shared-options.md#base), ви повинні додати префікс до кожного ключа з цим `base`.

Розширює [`http-proxy`](https://github.com/http-party/node-http-proxy#options). Додаткові опції [тут](https://github.com/vitejs/vite/blob/main/packages/vite/src/node/server/middlewares/proxy.ts#L13).

У деяких випадках ви також можете захотіти налаштувати основний сервер розробки (наприклад, щоб додати власні проміжні програмні засоби до внутрішнього [connect](https://github.com/senchalabs/connect) додатку). Для цього вам потрібно написати власний [плагін](/guide/using-plugins.html) і використовувати функцію [configureServer](/guide/api-plugin.html#configureserver).

**Приклад:**

```js
export default defineConfig({
  server: {
    proxy: {
      // рядковий скорочений запис:
      // http://localhost:5173/foo
      //   -> http://localhost:4567/foo
      '/foo': 'http://localhost:4567',
      // з опціями:
      // http://localhost:5173/api/bar
      //   -> http://jsonplaceholder.typicode.com/bar
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // з RegExp:
      // http://localhost:5173/fallback/
      //   -> http://jsonplaceholder.typicode.com/
      '^/fallback/.*': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/fallback/, ''),
      },
      // Використання екземпляра проксі
      '/api': {
        target: 'http://jsonplaceholder.typicode.com',
        changeOrigin: true,
        configure: (proxy, options) => {
          // proxy буде екземпляром 'http-proxy'
        },
      },
      // Проксіювання вебсокетів або socket.io:
      // ws://localhost:5173/socket.io
      //   -> ws://localhost:5174/socket.io
      // Будьте обережні, використовуючи `rewriteWsOrigin`, оскільки це може залишити
      // проксі відкритим для атак CSRF.
      '/socket.io': {
        target: 'ws://localhost:5174',
        ws: true,
        rewriteWsOrigin: true,
      },
    },
  },
})
```

## server.cors

- **Тип:** `boolean | CorsOptions`

Налаштуйте CORS для сервера розробки. Це увімкнено за замовчуванням і дозволяє будь-яке походження. Передайте [об'єкт опцій](https://github.com/expressjs/cors#configuration-options), щоб точно налаштувати поведінку або `false`, щоб вимкнути.

## server.headers

- **Тип:** `OutgoingHttpHeaders`

Вкажіть заголовки відповіді сервера.

## server.hmr

- **Тип:** `boolean | { protocol?: string, host?: string, port?: number, path?: string, timeout?: number, overlay?: boolean, clientPort?: number, server?: Server }`

Вимкніть або налаштуйте з'єднання HMR (у випадках, коли вебсокет HMR повинен використовувати іншу адресу, ніж HTTP-сервер).

Встановіть `server.hmr.overlay` на `false`, щоб вимкнути накладення помилок сервера.

`protocol` встановлює протокол WebSocket, що використовується для з'єднання HMR: `ws` (WebSocket) або `wss` (WebSocket Secure).

`clientPort` - це розширена опція, яка перевизначає порт тільки на стороні клієнта, дозволяючи вам обслуговувати вебсокет на іншому порту, ніж той, на якому клієнтський код шукає його.

Коли `server.hmr.server` визначено, Vite буде обробляти запити на з'єднання HMR через наданий сервер. Якщо не в режимі проміжного програмного забезпечення, Vite спробує обробляти запити на з'єднання HMR через існуючий сервер. Це може бути корисно при використанні самопідписаних сертифікатів або коли ви хочете виставити Vite через мережу на одному порту.

Перегляньте [`vite-setup-catalogue`](https://github.com/sapphi-red/vite-setup-catalogue) для деяких прикладів.

::: tip ПРИМІТКА

З конфігурацією за замовчуванням, зворотні проксі перед Vite очікуються підтримувати проксіювання WebSocket. Якщо клієнт Vite HMR не вдається підключити WebSocket, клієнт перейде на підключення WebSocket безпосередньо до сервера Vite HMR, обходячи зворотні проксі:

```
Пряме підключення вебсокета. Перегляньте https://vite.dev/config/server-options/#server-hmr, щоб видалити попередню помилку з'єднання.
```

Помилку, яка з'являється в браузері, коли відбувається перехід, можна ігнорувати. Щоб уникнути помилки, безпосередньо обходячи зворотні проксі, ви можете:

- налаштувати зворотний проксі для проксіювання WebSocket також
- встановити [`server.strictPort = true`](#serverstrictport) і встановити `server.hmr.clientPort` на те саме значення, що і `server.port`
- встановити `server.hmr.port` на інше значення, ніж [`server.port`](#serverport)

:::

## server.warmup

- **Тип:** `{ clientFiles?: string[], ssrFiles?: string[] }`
- **Пов'язано:** [Попереднє завантаження часто використовуваних файлів](/guide/performance.html#warm-up-frequently-used-files)

Попереднє завантаження файлів для трансформації та кешування результатів. Це покращує початкове завантаження сторінки під час запуску сервера та запобігає каскадним трансформаціям.

`clientFiles` - це файли, які використовуються лише на клієнті, тоді як `ssrFiles` - це файли, які використовуються лише в SSR. Вони приймають масив шляхів до файлів або шаблони [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby), відносно до `root`.

Переконайтеся, що додаєте лише файли, які часто використовуються, щоб не перевантажити сервер розробки Vite під час запуску.

```js
export default defineConfig({
  server: {
    warmup: {
      clientFiles: ['./src/components/*.vue', './src/utils/big-utils.js'],
      ssrFiles: ['./src/server/modules/*.js'],
    },
  },
})
```

## server.watch

- **Тип:** `object | null`

Опції спостереження за файловою системою для передачі до [chokidar](https://github.com/paulmillr/chokidar#getting-started). Якщо передано опцію `ignored`, Vite автоматично конвертує будь-які рядки як шаблони [picomatch](https://github.com/micromatch/picomatch#globbing-features).

Сервер Vite спостерігає за `root` і за замовчуванням пропускає директорії `.git/`, `node_modules/` та `cacheDir` і `build.outDir` Vite. При оновленні спостережуваного файлу, Vite застосовує HMR і оновлює сторінку лише за потреби.

Якщо встановлено `null`, жодні файли не будуть спостерігатися. `server.watcher` не буде спостерігати за жодними файлами, і виклик `add` не матиме ефекту.

::: warning Спостереження за файлами в `node_modules`

Наразі неможливо спостерігати за файлами та пакетами в `node_modules`. Для подальшого прогресу та обхідних шляхів ви можете слідкувати за [issue #8619](https://github.com/vitejs/vite/issues/8619).

:::

::: warning Використання Vite на Windows Subsystem for Linux (WSL) 2

При запуску Vite на WSL2, спостереження за файловою системою не працює, коли файл редагується додатками Windows (не процесом WSL2). Це через [обмеження WSL2](https://github.com/microsoft/WSL/issues/4739). Це також стосується запуску на Docker з бекендом WSL2.

Щоб виправити це, ви можете:

- **Рекомендовано**: Використовувати додатки WSL2 для редагування ваших файлів.
  - Також рекомендується перемістити папку проекту за межі файлової системи Windows. Доступ до файлової системи Windows з WSL2 є повільним. Видалення цього навантаження покращить продуктивність.
- Встановити `{ usePolling: true }`.
  - Зверніть увагу, що [`usePolling` призводить до високого використання ЦП](https://github.com/paulmillr/chokidar#performance).

:::

## server.middlewareMode

- **Тип:** `boolean`
- **За замовчуванням:** `false`

Створіть сервер Vite у режимі проміжного програмного забезпечення.

- **Пов'язано:** [appType](./shared-options.md#apptype), [SSR - Налаштування сервера розробки](/guide/ssr.md#setting-up-the-dev-server)

- **Приклад:**

```js twoslash
import express from 'express'
import { createServer as createViteServer } from 'vite'

async function createServer() {
  const app = express()

  // Створіть сервер Vite у режимі проміжного програмного забезпечення
  const vite = await createViteServer({
    server: { middlewareMode: true },
    // не включайте проміжні програмні засоби обробки HTML за замовчуванням Vite
    appType: 'custom',
  })
  // Використовуйте екземпляр connect Vite як проміжне програмне забезпечення
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // Оскільки `appType` є `'custom'`, відповідь повинна бути надана тут.
    // Примітка: якщо `appType` є `'spa'` або `'mpa'`, Vite включає проміжні програмні засоби
    // для обробки запитів HTML та 404, тому користувацькі проміжні програмні засоби повинні бути додані
    // перед проміжними програмними засобами Vite, щоб вони набули чинності
  })
}

createServer()
```

## server.fs.strict

- **Тип:** `boolean`
- **За замовчуванням:** `true` (увімкнено за замовчуванням з Vite 2.7)

Обмежте обслуговування файлів за межами кореня робочої області.

## server.fs.allow

- **Тип:** `string[]`

Обмежте файли, які можуть бути обслуговувані через `/@fs/`. Коли `server.fs.strict` встановлено на `true`, доступ до файлів за межами цього списку директорій, які не імпортуються з дозволеного файлу, призведе до помилки 403.

Можна вказати як директорії, так і файли.

Vite буде шукати корінь потенційної робочої області та використовувати його за замовчуванням. Дійсна робоча область відповідає наступним умовам, інакше буде повернуто до [кореня проекту](/guide/#index-html-and-project-root).

- містить поле `workspaces` у `package.json`
- містить один з наступних файлів
  - `lerna.json`
  - `pnpm-workspace.yaml`

Приймає шлях для вказівки користувацького кореня робочої області. Може бути абсолютним шляхом або шляхом відносно до [кореня проекту](/guide/#index-html-and-project-root). Наприклад:

```js
export default defineConfig({
  server: {
    fs: {
      // Дозволити обслуговування файлів з одного рівня вище кореня проекту
      allow: ['..'],
    },
  },
})
```

Коли `server.fs.allow` вказано, автоматичне виявлення кореня робочої області буде вимкнено. Щоб розширити початкову поведінку, утиліта `searchForWorkspaceRoot` доступна:

```js
import { defineConfig, searchForWorkspaceRoot } from 'vite'

export default defineConfig({
  server: {
    fs: {
      allow: [
        // шукати корінь робочої області
        searchForWorkspaceRoot(process.cwd()),
        // ваші користувацькі правила
        '/path/to/custom/allow_directory',
        '/path/to/custom/allow_file.demo',
      ],
    },
  },
})
```

## server.fs.deny

- **Тип:** `string[]`
- **За замовчуванням:** `['.env', '.env.*', '*.{crt,pem}', '**/.git/**']`

Список заборонених файлів, які обмежено для обслуговування сервером розробки Vite. Це матиме вищий пріоритет, ніж [`server.fs.allow`](#serverfsallow). Підтримуються шаблони [picomatch](https://github.com/micromatch/picomatch#globbing-features).

## server.origin

- **Тип:** `string`

Визначає походження URL-адрес створених ресурсів під час розробки.

```js
export default defineConfig({
  server: {
    origin: 'http://127.0.0.1:8080',
  },
})
```

## server.sourcemapIgnoreList

- **Тип:** `false | (sourcePath: string, sourcemapPath: string) => boolean`
- **За замовчуванням:** `(sourcePath) => sourcePath.includes('node_modules')`

Чи слід ігнорувати вихідні файли у вихідній карті сервера, використовується для заповнення розширення вихідної карти [`x_google_ignoreList`](https://developer.chrome.com/articles/x-google-ignore-list/).

`server.sourcemapIgnoreList` є еквівалентом [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) для сервера розробки. Різниця між двома параметрами конфігурації полягає в тому, що функція rollup викликається з відносним шляхом для `sourcePath`, тоді як `server.sourcemapIgnoreList` викликається з абсолютним шляхом. Під час розробки більшість модулів мають карту та джерело в одній папці, тому відносний шлях для `sourcePath` є самим ім'ям файлу. У таких випадках абсолютні шляхи зручні для використання.

За замовчуванням виключає всі шляхи, що містять `node_modules`. Ви можете передати `false`, щоб вимкнути цю поведінку, або, для повного контролю, функцію, яка приймає шлях до джерела та шлях до вихідної карти і повертає, чи слід ігнорувати шлях до джерела.

```js
export default defineConfig({
  server: {
    // Це значення за замовчуванням, і додасть усі файли з node_modules
    // у їхніх шляхах до списку ігнорування.
    sourcemapIgnoreList(sourcePath, sourcemapPath) {
      return sourcePath.includes('node_modules')
    },
  },
})
```

::: tip Примітка
[`server.sourcemapIgnoreList`](#serversourcemapignorelist) та [`build.rollupOptions.output.sourcemapIgnoreList`](https://rollupjs.org/configuration-options/#output-sourcemapignorelist) потрібно встановлювати незалежно. `server.sourcemapIgnoreList` є лише конфігурацією сервера і не отримує значення за замовчуванням з визначених параметрів rollup.
:::
