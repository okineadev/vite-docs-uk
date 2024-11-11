# Серверний рендеринг

:::tip Примітка
SSR спеціально стосується фронтенд-фреймворків (наприклад, React, Preact, Vue та Svelte), які підтримують запуск тієї ж самої програми в Node.js, попередньо рендерять її в HTML і, нарешті, гідрують її на клієнті. Якщо ви шукаєте інтеграцію з традиційними серверними фреймворками, перегляньте [Посібник з інтеграції бекенду](./backend-integration).

Наступний посібник також передбачає попередній досвід роботи з SSR у вашому вибраному фреймворку і зосередиться лише на деталях інтеграції з Vite.
:::

:::warning Низькорівневий API
Це низькорівневий API, призначений для авторів бібліотек і фреймворків. Якщо ваша мета - створити додаток, обов'язково ознайомтеся з високорівневими плагінами та інструментами SSR у розділі [Awesome Vite SSR](https://github.com/vitejs/awesome-vite#ssr). Тим не менш, багато додатків успішно створюються безпосередньо на основі низькорівневого API Vite.

Наразі Vite працює над покращеним API SSR з [Environment API](https://github.com/vitejs/vite/discussions/16358). Перегляньте посилання для отримання додаткової інформації.
:::

:::tip Допомога
Якщо у вас є питання, спільнота зазвичай допомагає у [каналі #ssr на Vite Discord](https://discord.gg/PkbxgzPhJv).
:::

## Прикладні проекти

Vite надає вбудовану підтримку серверного рендерингу (SSR). [`create-vite-extra`](https://github.com/bluwy/create-vite-extra) містить приклади налаштувань SSR, які ви можете використовувати як посилання для цього посібника:

- [Vanilla](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vanilla)
- [Vue](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue)
- [React](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-react)
- [Preact](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-preact)
- [Svelte](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-svelte)
- [Solid](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-solid)

Ви також можете створити ці проекти локально, [запустивши `create-vite`](./index.md#scaffolding-your-first-vite-project) і вибравши `Others > create-vite-extra` у варіанті фреймворку.

## Структура джерел

Типовий додаток SSR матиме наступну структуру файлів:

```
- index.html
- server.js # основний сервер додатка
- src/
  - main.js          # експортує універсальний код додатка
  - entry-client.js  # монтує додаток до DOM-елемента
  - entry-server.js  # рендерить додаток за допомогою SSR API фреймворку
```

`index.html` повинен посилатися на `entry-client.js` і включати заповнювач, де має бути вставлений серверний рендеринг:

```html [index.html]
<div id="app"><!--ssr-outlet--></div>
<script type="module" src="/src/entry-client.js"></script>
```

Ви можете використовувати будь-який заповнювач замість `<!--ssr-outlet-->`, доки він може бути точно замінений.

## Умовна логіка

Якщо вам потрібно виконати умовну логіку на основі SSR або клієнта, ви можете використовувати

```js twoslash
import 'vite/client'
// ---cut---
if (import.meta.env.SSR) {
  // ... логіка тільки для сервера
}
```

Це статично замінюється під час збірки, тому дозволяє видаляти непотрібні гілки.

## Налаштування сервера розробки

При створенні додатка SSR ви, ймовірно, захочете мати повний контроль над основним сервером і відокремити Vite від виробничого середовища. Тому рекомендується використовувати Vite в режимі проміжного програмного забезпечення. Ось приклад з [express](https://expressjs.com/) (v4):

```js{15-18} twoslash [server.js]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function createServer() {
  const app = express()

  // Створіть сервер Vite в режимі проміжного програмного забезпечення та налаштуйте тип додатка як
  // 'custom', відключивши власну логіку обслуговування HTML Vite, щоб батьківський сервер
  // міг взяти на себе контроль
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom'
  })

  // Використовуйте екземпляр connect Vite як проміжне програмне забезпечення. Якщо ви використовуєте власний
  // маршрутизатор express (express.Router()), ви повинні використовувати router.use
  // Коли сервер перезапускається (наприклад, після зміни користувачем
  // vite.config.js), `vite.middlewares` все одно буде тим самим
  // посиланням (з новим внутрішнім стеком проміжного програмного забезпечення Vite та плагінів). Наступне є дійсним навіть після перезапусків.
  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    // обслуговуйте index.html - ми розглянемо це далі
  })

  app.listen(5173)
}

createServer()
```

Тут `vite` є екземпляром [ViteDevServer](./api-javascript#vitedevserver). `vite.middlewares` є екземпляром [Connect](https://github.com/senchalabs/connect), який можна використовувати як проміжне програмне забезпечення в будь-якому сумісному з Connect фреймворку Node.js.

Наступний крок - реалізація обробника `*` для обслуговування серверного рендерингу HTML:

```js twoslash [server.js]
// @noErrors
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/** @type {import('express').Express} */
var app
/** @type {import('vite').ViteDevServer}  */
var vite

// ---cut---
app.use('*', async (req, res, next) => {
  const url = req.originalUrl

  try {
    // 1. Прочитайте index.html
    let template = fs.readFileSync(
      path.resolve(__dirname, 'index.html'),
      'utf-8',
    )

    // 2. Застосуйте HTML-трансформації Vite. Це вставляє клієнт HMR Vite,
    //    а також застосовує HTML-трансформації з плагінів Vite, наприклад, глобальні
    //    преамбули з @vitejs/plugin-react
    template = await vite.transformIndexHtml(url, template)

    // 3. Завантажте серверний вхід. ssrLoadModule автоматично трансформує
    //    вихідний код ESM для використання в Node.js! Немає необхідності в бандлінгу,
    //    і забезпечує ефективну інвалідацію, подібну до HMR.
    const { render } = await vite.ssrLoadModule('/src/entry-server.js')

    // 4. Відрендеріть HTML додатка. Це передбачає, що експортована
    //    функція `render` з entry-server.js викликає відповідні SSR API фреймворку,
    //    наприклад, ReactDOMServer.renderToString()
    const appHtml = await render(url)

    // 5. Вставте відрендерений HTML додатка в шаблон.
    const html = template.replace(`<!--ssr-outlet-->`, appHtml)

    // 6. Відправте відрендерений HTML назад.
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
  } catch (e) {
    // Якщо виникла помилка, дозвольте Vite виправити стек трасування, щоб він відповідав
    // вашому фактичному вихідному коду.
    vite.ssrFixStacktrace(e)
    next(e)
  }
})
```

Скрипт `dev` у `package.json` також слід змінити для використання серверного скрипта:

```diff [package.json]
  "scripts": {
-   "dev": "vite"
+   "dev": "node server"
  }
```

## Збірка для продакшн

Щоб відправити проект SSR у продакшн, нам потрібно:

1. Створити клієнтську збірку як зазвичай;
2. Створити SSR-збірку, яку можна безпосередньо завантажити через `import()`, щоб не потрібно було використовувати `ssrLoadModule` Vite;

Наші скрипти в `package.json` будуть виглядати так:

```json [package.json]
{
  "scripts": {
    "dev": "node server",
    "build:client": "vite build --outDir dist/client",
    "build:server": "vite build --outDir dist/server --ssr src/entry-server.js"
  }
}
```

Зверніть увагу на прапорець `--ssr`, який вказує, що це SSR-збірка. Він також повинен вказувати на SSR-вхід.

Потім у `server.js` нам потрібно додати деяку логіку, специфічну для продакшн, перевіряючи `process.env.NODE_ENV`:

- Замість читання кореневого `index.html`, використовуйте `dist/client/index.html` як шаблон, оскільки він містить правильні посилання на ресурси клієнтської збірки.

- Замість `await vite.ssrLoadModule('/src/entry-server.js')`, використовуйте `import('./dist/server/entry-server.js')` (цей файл є результатом SSR-збірки).

- Перемістіть створення та всі використання dev-сервера `vite` за умовні гілки, що стосуються лише розробки, а потім додайте проміжне програмне забезпечення для обслуговування статичних файлів з `dist/client`.

Зверніться до [прикладних проектів](#прикладні-проекти) для робочого налаштування.

## Генерація директив попереднього завантаження

`vite build` підтримує прапорець `--ssrManifest`, який згенерує `.vite/ssr-manifest.json` у вихідному каталозі збірки:

```diff
- "build:client": "vite build --outDir dist/client",
+ "build:client": "vite build --outDir dist/client --ssrManifest",
```

Вищезазначений скрипт тепер згенерує `dist/client/.vite/ssr-manifest.json` для клієнтської збірки (Так, SSR-маніфест генерується з клієнтської збірки, оскільки ми хочемо зіставити ідентифікатори модулів з клієнтськими файлами). Маніфест містить зіставлення ідентифікаторів модулів з їх відповідними чанками та файлами ресурсів.

Щоб використовувати маніфест, фреймворки повинні надати спосіб зібрати ідентифікатори модулів компонентів, які використовувалися під час виклику серверного рендерингу.

`@vitejs/plugin-vue` підтримує це з коробки та автоматично реєструє використані ідентифікатори модулів у відповідному контексті SSR Vue:

```js [src/entry-server.js]
const ctx = {}
const html = await vueServerRenderer.renderToString(app, ctx)
// ctx.modules тепер є набором ідентифікаторів модулів, які використовувалися під час рендерингу
```

У продакшн-гілці `server.js` нам потрібно прочитати та передати маніфест у функцію `render`, експортовану з `src/entry-server.js`. Це надасть нам достатньо інформації для рендерингу директив попереднього завантаження для файлів, які використовуються асинхронними маршрутами! Дивіться [демо-джерело](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/src/entry-server.js) для повного прикладу. Ви також можете використовувати цю інформацію для [103 Early Hints](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/103).

## Попереднє рендерування / SSG

Якщо маршрути та дані, необхідні для певних маршрутів, відомі заздалегідь, ми можемо попередньо рендерити ці маршрути в статичний HTML, використовуючи ту саму логіку, що й продакшн SSR. Це також можна вважати формою генерації статичних сайтів (SSG). Дивіться [демо-скрипт попереднього рендерування](https://github.com/vitejs/vite-plugin-vue/blob/main/playground/ssr-vue/prerender.js) для робочого прикладу.

## SSR Externals

Залежності "екстерналізуються" з системи трансформації модулів SSR Vite за замовчуванням під час запуску SSR. Це прискорює як розробку, так і збірку.

Якщо залежність потребує трансформації за допомогою конвеєра Vite, наприклад, через використання функцій Vite без транспіляції, їх можна додати до [`ssr.noExternal`](../config/ssr-options.md#ssr-noexternal).

Для пов'язаних залежностей вони не екстерналізуються за замовчуванням, щоб скористатися HMR Vite. Якщо це не бажано, наприклад, для тестування залежностей так, ніби вони не пов'язані, ви можете додати їх до [`ssr.external`](../config/ssr-options.md#ssr-external).

:::warning Робота з Аліасами
Якщо ви налаштували аліаси, які перенаправляють один пакет на інший, можливо, вам доведеться аліасувати фактичні пакети `node_modules`, щоб це працювало для екстерналізованих залежностей SSR. Як [Yarn](https://classic.yarnpkg.com/en/docs/cli/add/#toc-yarn-add-alias), так і [pnpm](https://pnpm.io/aliases/) підтримують аліасування через префікс `npm:`.
:::

## Логіка плагінів, специфічна для SSR

Деякі фреймворки, такі як Vue або Svelte, компілюють компоненти в різні формати залежно від клієнта або SSR. Щоб підтримувати умовні трансформації, Vite передає додаткову властивість `ssr` в об'єкті `options` наступних хуків плагінів:

- `resolveId`
- `load`
- `transform`

**Приклад:**

```js twoslash
/** @type {() => import('vite').Plugin} */
// ---cut---
export function mySSRPlugin() {
  return {
    name: 'my-ssr',
    transform(code, id, options) {
      if (options?.ssr) {
        // виконайте специфічну для SSR трансформацію...
      }
    },
  }
}
```

Об'єкт options у хуках `load` та `transform` є необов'язковим, rollup наразі не використовує цей об'єкт, але може розширити ці хуки додатковими метаданими в майбутньому.

:::tip Примітка
До Vite 2.7 це повідомлялося хукам плагінів за допомогою позиційного параметра `ssr` замість використання об'єкта `options`. Усі основні фреймворки та плагіни оновлені, але ви можете знайти застарілі пости, що використовують попередній API.
:::

## Ціль SSR

Ціль за замовчуванням для збірки SSR - це середовище node, але ви також можете запускати сервер у Web Worker. Розв'язання входу пакетів відрізняється для кожної платформи. Ви можете налаштувати ціль як Web Worker, використовуючи `ssr.target`, встановлений на `'webworker'`.

## SSR Bundle

У деяких випадках, таких як середовища `webworker`, ви можете захотіти зібрати свою SSR-збірку в один файл JavaScript. Ви можете увімкнути цю поведінку, встановивши `ssr.noExternal` на `true`. Це зробить дві речі:

- Вважати всі залежності як `noExternal`
- Викинути помилку, якщо будь-які вбудовані модулі Node.js імпортуються

## Умови розв'язання SSR

За замовчуванням розв'язання входу пакетів буде використовувати умови, встановлені в [`resolve.conditions`](../config/shared-options.md#resolve-conditions) для збірки SSR. Ви можете використовувати [`ssr.resolve.conditions`](../config/ssr-options.md#ssr-resolve-conditions) та [`ssr.resolve.externalConditions`](../config/ssr-options.md#ssr-resolve-externalconditions) для налаштування цієї поведінки.

## Vite CLI

Команди CLI `$ vite dev` та `$ vite preview` також можуть використовуватися для додатків SSR. Ви можете додати свої проміжні програмні забезпечення SSR до сервера розробки за допомогою [`configureServer`](/guide/api-plugin#configureserver) та до сервера попереднього перегляду за допомогою [`configurePreviewServer`](/guide/api-plugin#configurepreviewserver).

:::tip Примітка
Використовуйте пост-хук, щоб ваше проміжне програмне забезпечення SSR запускалося _після_ проміжних програм Vite.
:::
