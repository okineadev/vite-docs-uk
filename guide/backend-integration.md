# Інтеграція з бекендом

:::tip Примітка
Якщо ви хочете використовувати традиційний бекенд (наприклад, Rails, Laravel) для обслуговування HTML, але використовувати Vite для обслуговування активів, перевірте існуючі інтеграції, перелічені в [Awesome Vite](https://github.com/vitejs/awesome-vite#integrations-with-backends).

Якщо вам потрібна власна інтеграція, ви можете дотримуватися кроків у цьому посібнику, щоб налаштувати її вручну.
:::

1. У вашій конфігурації Vite налаштуйте вхідну точку та увімкніть маніфест збірки:

  ```js twoslash [vite.config.js]
  import { defineConfig } from 'vite'
  // ---cut---
  export default defineConfig({
    build: {
     // генерує .vite/manifest.json у outDir
     manifest: true,
     rollupOptions: {
      // перезаписує стандартну вхідну точку .html
      input: '/path/to/main.js',
     },
    },
  })
  ```

  Якщо ви не вимкнули [поліфіл попереднього завантаження модулів](/config/build-options.md#build-polyfillmodulepreload), вам також потрібно імпортувати поліфіл у вашу вхідну точку

  ```js
  // додайте на початку вашої вхідної точки додатку
  import 'vite/modulepreload-polyfill'
  ```

2. Для розробки, вставте наступне у HTML-шаблон вашого сервера (замініть `http://localhost:5173` на локальну URL-адресу, на якій працює Vite):

  ```html
  <!-- якщо розробка -->
  <script type="module" src="http://localhost:5173/@vite/client"></script>
  <script type="module" src="http://localhost:5173/main.js"></script>
  ```

  Щоб правильно обслуговувати активи, у вас є два варіанти:

  - Переконайтеся, що сервер налаштований на проксі-запити статичних активів до сервера Vite
  - Встановіть [`server.origin`](/config/server-options.md#server-origin), щоб згенеровані URL-адреси активів вирішувалися за допомогою URL-адреси бекенд-сервера замість відносного шляху

  Це необхідно для правильного завантаження активів, таких як зображення.

  Зверніть увагу, якщо ви використовуєте React з `@vitejs/plugin-react`, вам також потрібно додати це перед вищезазначеними скриптами, оскільки плагін не може змінити HTML, який ви обслуговуєте (замініть `http://localhost:5173` на локальну URL-адресу, на якій працює Vite):

  ```html
  <script type="module">
    import RefreshRuntime from 'http://localhost:5173/@react-refresh'
    RefreshRuntime.injectIntoGlobalHook(window)
    window.$RefreshReg$ = () => {}
    window.$RefreshSig$ = () => (type) => type
    window.__vite_plugin_react_preamble_installed__ = true
  </script>
  ```

3. Для продакшн: після запуску `vite build`, файл `.vite/manifest.json` буде згенерований разом з іншими файлами активів. Приклад файлу маніфесту виглядає так:

  ```json [.vite/manifest.json]
  {
    "_shared-B7PI925R.js": {
     "file": "assets/shared-B7PI925R.js",
     "name": "shared",
     "css": ["assets/shared-ChJ_j-JJ.css"]
    },
    "_shared-ChJ_j-JJ.css": {
     "file": "assets/shared-ChJ_j-JJ.css",
     "src": "_shared-ChJ_j-JJ.css"
    },
    "baz.js": {
     "file": "assets/baz-B2H3sXNv.js",
     "name": "baz",
     "src": "baz.js",
     "isDynamicEntry": true
    },
    "views/bar.js": {
     "file": "assets/bar-gkvgaI9m.js",
     "name": "bar",
     "src": "views/bar.js",
     "isEntry": true,
     "imports": ["_shared-B7PI925R.js"],
     "dynamicImports": ["baz.js"]
    },
    "views/foo.js": {
     "file": "assets/foo-BRBmoGS9.js",
     "name": "foo",
     "src": "views/foo.js",
     "isEntry": true,
     "imports": ["_shared-B7PI925R.js"],
     "css": ["assets/foo-5UjPuW-k.css"]
    }
  }
  ```

  - Маніфест має структуру `Record<name, chunk>`
  - Для вхідних або динамічних вхідних чанків ключ є відносним шляхом від кореня проекту.
  - Для не вхідних чанків ключ є базовим ім'ям згенерованого файлу з префіксом `_`.
  - Чанки міститимуть інформацію про свої статичні та динамічні імпорти (обидва є ключами, які відповідають відповідному чанку в маніфесті), а також про свої відповідні CSS та файли активів (якщо такі є).

4. Ви можете використовувати цей файл для рендерингу посилань або директив попереднього завантаження з хешованими іменами файлів.

  Ось приклад HTML-шаблону для рендерингу правильних посилань. Синтаксис тут наведено для пояснення, замініть його на вашу серверну мову шаблонів. Функція `importedChunks` наведена для ілюстрації і не надається Vite.

  ```html
  <!-- якщо продакшн -->

  <!-- для cssFile з manifest[name].css -->
  <link rel="stylesheet" href="/{{ cssFile }}" />

  <!-- для chunk з importedChunks(manifest, name) -->
  <!-- для cssFile з chunk.css -->
  <link rel="stylesheet" href="/{{ cssFile }}" />

  <script type="module" src="/{{ manifest[name].file }}"></script>

  <!-- для chunk з importedChunks(manifest, name) -->
  <link rel="modulepreload" href="/{{ chunk.file }}" />
  ```

  Зокрема, бекенд, що генерує HTML, повинен включати наступні теги, враховуючи файл маніфесту та вхідну точку:

  - Тег `<link rel="stylesheet">` для кожного файлу у списку `css` вхідного чанку
  - Рекурсивно слідуйте за всіма чанками у списку `imports` вхідного чанку та включайте тег `<link rel="stylesheet">` для кожного CSS-файлу кожного імпортованого чанку.
  - Тег для ключа `file` вхідного чанку (`<script type="module">` для JavaScript або `<link rel="stylesheet">` для CSS)
  - За бажанням, тег `<link rel="modulepreload">` для `file` кожного імпортованого JavaScript-чанку, знову ж таки рекурсивно слідуючи за імпортами, починаючи з вхідного чанку.

  Відповідно до наведеного вище прикладу маніфесту, для вхідної точки `views/foo.js` у продакшн слід включити наступні теги:

  ```html
  <link rel="stylesheet" href="assets/foo-5UjPuW-k.css" />
  <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
  <script type="module" src="assets/foo-BRBmoGS9.js"></script>
  <!-- за бажанням -->
  <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
  ```

  А для вхідної точки `views/bar.js` слід включити наступні теги:

  ```html
  <link rel="stylesheet" href="assets/shared-ChJ_j-JJ.css" />
  <script type="module" src="assets/bar-gkvgaI9m.js"></script>
  <!-- за бажанням -->
  <link rel="modulepreload" href="assets/shared-B7PI925R.js" />
  ```

  ::: details Псевдо реалізація `importedChunks`
  Приклад псевдо реалізації `importedChunks` на TypeScript (це потрібно адаптувати для вашої мови програмування та мови шаблонів):

  ```ts
  import type { Manifest, ManifestChunk } from 'vite'

  export default function importedChunks(
    manifest: Manifest,
    name: string,
  ): ManifestChunk[] {
    const seen = new Set<string>()

    function getImportedChunks(chunk: ManifestChunk): ManifestChunk[] {
     const chunks: ManifestChunk[] = []
     for (const file of chunk.imports ?? []) {
      const importee = manifest[file]
      if (seen.has(file)) {
        continue
      }
      seen.add(file)

      chunks.push(...getImportedChunks(importee))
      chunks.push(importee)
     }

     return chunks
    }

    return getImportedChunks(manifest[name])
  }
  ```

  :::
