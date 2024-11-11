# Побудова для Продакшн

Коли настає час розгортати ваш додаток для продакшн, просто виконайте команду `vite build`. За замовчуванням, вона використовує `<root>/index.html` як точку входу для збірки і створює пакет додатка, який підходить для розміщення на статичному хостингу. Перегляньте [Розгортання статичного сайту](./static-deploy) для керівництв щодо популярних сервісів.

## Сумісність з браузерами

Пакет для продакшн передбачає підтримку сучасного JavaScript. За замовчуванням, Vite орієнтується на браузери, які підтримують [нативні ES модулі](https://caniuse.com/es6-module), [нативний динамічний імпорт ESM](https://caniuse.com/es6-module-dynamic-import) та [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta):

- Chrome >=87
- Firefox >=78
- Safari >=14
- Edge >=88

Ви можете вказати власні цілі через опцію конфігурації [`build.target`](/config/build-options.md#build-target), де найнижча ціль - `es2015`.

Зверніть увагу, що за замовчуванням Vite обробляє лише синтаксичні перетворення і **не включає поліфіли**. Ви можете переглянути https://cdnjs.cloudflare.com/polyfill/, який автоматично генерує пакети поліфілів на основі рядка UserAgent браузера користувача.

Старі браузери можуть бути підтримані через [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy), який автоматично генерує застарілі фрагменти та відповідні поліфіли функцій мови ES. Застарілі фрагменти завантажуються умовно лише в браузерах, які не мають нативної підтримки ESM.

## Публічний базовий шлях

- Пов'язано: [Обробка активів](./assets)

Якщо ви розгортаєте свій проект під вкладеним публічним шляхом, просто вкажіть опцію конфігурації [`base`](/config/shared-options.md#base), і всі шляхи до активів будуть відповідно переписані. Цю опцію також можна вказати як прапорець командного рядка, наприклад, `vite build --base=/my/public/path/`.

URL-адреси активів, імпортованих через JS, посилання в CSS `url()` та посилання на активи у ваших `.html` файлах автоматично налаштовуються відповідно до цієї опції під час збірки.

Виняток становить випадок, коли вам потрібно динамічно конкатенувати URL-адреси на льоту. У цьому випадку ви можете використовувати глобально впроваджену змінну `import.meta.env.BASE_URL`, яка буде публічним базовим шляхом. Зверніть увагу, що ця змінна статично замінюється під час збірки, тому вона повинна з'являтися саме такою, як є (тобто `import.meta.env['BASE_URL']` не працюватиме).

Для розширеного контролю базового шляху перегляньте [Розширені опції базового шляху](#розширені-опції-базового-шляху).

### Відносний базовий шлях

Якщо ви не знаєте базовий шлях заздалегідь, ви можете встановити відносний базовий шлях за допомогою `"base": "./"` або `"base": ""`. Це зробить всі згенеровані URL-адреси відносними до кожного файлу.

:::warning Підтримка старих браузерів при використанні відносних баз

Підтримка `import.meta` потрібна для відносних баз. Якщо вам потрібно підтримувати [браузери, які не підтримують `import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta), ви можете використовувати [плагін `legacy`](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy).

:::

## Налаштування збірки

Збірку можна налаштувати за допомогою різних [опцій конфігурації збірки](/config/build-options.md). Зокрема, ви можете безпосередньо налаштувати основні [опції Rollup](https://rollupjs.org/configuration-options/) через `build.rollupOptions`:

```js [vite.config.js]
export default defineConfig({
  build: {
    rollupOptions: {
      // https://rollupjs.org/configuration-options/
    },
  },
})
```

Наприклад, ви можете вказати кілька виходів Rollup з плагінами, які застосовуються лише під час збірки.

## Стратегія розбиття на фрагменти

Ви можете налаштувати, як розбиваються фрагменти, використовуючи `build.rollupOptions.output.manualChunks` (див. [документацію Rollup](https://rollupjs.org/configuration-options/#output-manualchunks)). Якщо ви використовуєте фреймворк, зверніться до їх документації для налаштування розбиття на фрагменти.

## Обробка помилок завантаження

Vite генерує подію `vite:preloadError`, коли не вдається завантажити динамічні імпорти. `event.payload` містить оригінальну помилку імпорту. Якщо ви викликаєте `event.preventDefault()`, помилка не буде викинута.

```js twoslash
window.addEventListener('vite:preloadError', (event) => {
  window.location.reload() // наприклад, оновити сторінку
})
```

Коли відбувається нове розгортання, хостингова служба може видалити активи з попередніх розгортань. В результаті, користувач, який відвідав ваш сайт до нового розгортання, може зіткнутися з помилкою імпорту. Ця помилка виникає через те, що активи, які працюють на пристрої користувача, застаріли, і він намагається імпортувати відповідний старий фрагмент, який видалено. Ця подія корисна для вирішення цієї ситуації.

## Перезбірка при зміні файлів

Ви можете увімкнути спостерігач Rollup за допомогою `vite build --watch`. Або ви можете безпосередньо налаштувати основні [`WatcherOptions`](https://rollupjs.org/configuration-options/#watch) через `build.watch`:

```js [vite.config.js]
export default defineConfig({
  build: {
    watch: {
      // https://rollupjs.org/configuration-options/#watch
    },
  },
})
```

З увімкненим прапорцем `--watch`, зміни у файлі `vite.config.js`, а також будь-які файли, які потрібно зібрати, спричинять перезбірку.

## Багатосторінковий додаток

Припустимо, у вас є така структура вихідного коду:

```
├── package.json
├── vite.config.js
├── index.html
├── main.js
└── nested
    ├── index.html
    └── nested.js
```

Під час розробки просто перейдіть або створіть посилання на `/nested/` - це працює як очікується, так само як і для звичайного статичного файлового сервера.

Під час збірки все, що вам потрібно зробити, це вказати кілька `.html` файлів як точки входу:

```js twoslash [vite.config.js]
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        nested: resolve(__dirname, 'nested/index.html'),
      },
    },
  },
})
```

Якщо ви вказуєте інший корінь, пам'ятайте, що `__dirname` все одно буде папкою вашого файлу vite.config.js при вирішенні шляхів входу. Тому вам потрібно буде додати ваш запис `root` до аргументів для `resolve`.

Зверніть увагу, що для HTML файлів Vite ігнорує ім'я, надане для входу в об'єкті `rollupOptions.input`, і замість цього враховує ідентифікатор файлу при генерації HTML активу в папці dist. Це забезпечує узгоджену структуру з тим, як працює сервер розробки.

## Режим бібліотеки

Коли ви розробляєте бібліотеку, орієнтовану на браузер, ви, ймовірно, більшу частину часу проводите на тестовій/демо сторінці, яка імпортує вашу фактичну бібліотеку. З Vite ви можете використовувати ваш `index.html` для цієї мети, щоб отримати плавний досвід розробки.

Коли настає час збирати вашу бібліотеку для розповсюдження, використовуйте опцію конфігурації [`build.lib`](/config/build-options.md#build-lib). Переконайтеся, що також винесли будь-які залежності, які ви не хочете включати у вашу бібліотеку, наприклад, `vue` або `react`:

::: code-group

```js twoslash [vite.config.js (один вхід)]
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'lib/main.js'),
      name: 'MyLib',
      // правильні розширення будуть додані
      fileName: 'my-lib',
    },
    rollupOptions: {
      // переконайтеся, що винесли залежності, які не повинні бути включені
      // у вашу бібліотеку
      external: ['vue'],
      output: {
        // Надати глобальні змінні для використання в UMD збірці
        // для винесених залежностей
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

```js twoslash [vite.config.js (кілька входів)]
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    lib: {
      entry: {
        'my-lib': resolve(__dirname, 'lib/main.js'),
        secondary: resolve(__dirname, 'lib/secondary.js'),
      },
      name: 'MyLib',
    },
    rollupOptions: {
      // переконайтеся, що винесли залежності, які не повинні бути включені
      // у вашу бібліотеку
      external: ['vue'],
      output: {
        // Надати глобальні змінні для використання в UMD збірці
        // для винесених залежностей
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
})
```

:::

Вхідний файл міститиме експорти, які можуть бути імпортовані користувачами вашого пакету:

```js [lib/main.js]
import Foo from './Foo.vue'
import Bar from './Bar.vue'
export { Foo, Bar }
```

Запуск `vite build` з цією конфігурацією використовує пресет Rollup, орієнтований на доставку бібліотек, і створює два формати збірки:

- `es` і `umd` (для одного входу)
- `es` і `cjs` (для кількох входів)

Формати можна налаштувати за допомогою опції [`build.lib.formats`](/config/build-options.md#build-lib).

```
$ vite build
збірка для продакшн...
dist/my-lib.js      0.08 kB / gzip: 0.07 kB
dist/my-lib.umd.cjs 0.30 kB / gzip: 0.16 kB
```

Рекомендований `package.json` для вашої бібліотеки:

::: code-group

```json [package.json (один вхід)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    }
  }
}
```

```json [package.json (кілька входів)]
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.cjs"
    },
    "./secondary": {
      "import": "./dist/secondary.js",
      "require": "./dist/secondary.cjs"
    }
  }
}
```

:::

### Підтримка CSS

Якщо ваша бібліотека імпортує будь-який CSS, він буде зібраний як один CSS файл поруч зі зібраними JS файлами, наприклад, `dist/my-lib.css`. Ім'я за замовчуванням відповідає `build.lib.fileName`, але його також можна змінити за допомогою [`build.lib.cssFileName`](/config/build-options.md#build-lib).

Ви можете експортувати CSS файл у вашому `package.json`, щоб його могли імпортувати користувачі:

```json {12}
{
  "name": "my-lib",
  "type": "module",
  "files": ["dist"],
  "main": "./dist/my-lib.umd.cjs",
  "module": "./dist/my-lib.js",
  "exports": {
    ".": {
      "import": "./dist/my-lib.js",
      "require": "./dist/my-lib.umd.cjs"
    },
    "./style.css": "./dist/my-lib.css"
  }
}
```

::: tip Розширення файлів
Якщо `package.json` не містить `"type": "module"`, Vite згенерує різні розширення файлів для сумісності з Node.js. `.js` стане `.mjs`, а `.cjs` стане `.js`.
:::

::: tip Змінні середовища
У режимі бібліотеки всі використання [`import.meta.env.*`](./env-and-mode.md) статично замінюються під час збірки для продакшн. Однак, використання `process.env.*` не замінюється, щоб споживачі вашої бібліотеки могли динамічно змінювати його. Якщо це небажано, ви можете використовувати `define: { 'process.env.NODE_ENV': '"production"' }`, наприклад, щоб статично замінити їх, або використовувати [`esm-env`](https://github.com/benmccann/esm-env) для кращої сумісності з бандлерами та середовищами виконання.
:::

::: warning Розширене використання
Режим бібліотеки включає просту та думкову конфігурацію для бібліотек, орієнтованих на браузер та JS фреймворки. Якщо ви створюєте бібліотеки, не орієнтовані на браузер, або потребуєте розширених потоків збірки, ви можете використовувати [Rollup](https://rollupjs.org) або [esbuild](https://esbuild.github.io) безпосередньо.
:::

## Розширені опції базового шляху

::: warning
Ця функція експериментальна. [Залиште відгук](https://github.com/vitejs/vite/discussions/13834).
:::

Для розширених випадків використання згенеровані активи та публічні файли можуть бути в різних шляхах, наприклад, для використання різних стратегій кешування.
Користувач може вибрати розгортання в трьох різних шляхах:

- Згенеровані HTML файли (які можуть бути оброблені під час SSR)
- Згенеровані хешовані активи (JS, CSS та інші типи файлів, такі як зображення)
- Скопійовані [публічні файли](assets.md#the-public-directory)

Єдиний статичний [базовий шлях](#публічний-базовий-шлях)недостатній у цих сценаріях. Vite надає експериментальну підтримку розширених базових опцій під час збірки, використовуючи `experimental.renderBuiltUrl`.

```ts twoslash
import type { UserConfig } from 'vite'
// prettier-ignore
const config: UserConfig = {
// ---cut-before---
experimental: {
  renderBuiltUrl(filename, { hostType }) {
    if (hostType === 'js') {
      return { runtime: `window.__toCdnUrl(${JSON.stringify(filename)})` }
    } else {
      return { relative: true }
    }
  },
},
// ---cut-after---
}
```

Якщо хешовані активи та публічні файли не розгортаються разом, опції для кожної групи можуть бути визначені незалежно, використовуючи тип активу `type`, включений у другий параметр `context`, переданий функції.

```ts twoslash
import type { UserConfig } from 'vite'
import path from 'node:path'
// prettier-ignore
const config: UserConfig = {
// ---cut-before---
experimental: {
  renderBuiltUrl(filename, { hostId, hostType, type }) {
    if (type === 'public') {
      return 'https://www.domain.com/' + filename
    } else if (path.extname(hostId) === '.js') {
      return {
        runtime: `window.__assetsPath(${JSON.stringify(filename)})`
      }
    } else {
      return 'https://cdn.domain.com/assets/' + filename
    }
  },
},
// ---cut-after---
}
```

Зверніть увагу, що переданий `filename` є декодованим URL, і якщо функція повертає рядок URL, він також повинен бути декодованим. Vite автоматично оброблятиме кодування під час рендерингу URL. Якщо повертається об'єкт з `runtime`, кодування повинно бути оброблено самостійно, де це необхідно, оскільки код виконання буде рендеритися як є.
