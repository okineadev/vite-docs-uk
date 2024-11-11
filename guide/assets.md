# Обробка статичних ресурсів

- Пов'язано: [Публічний базовий шлях](./build#public-base-path)
- Пов'язано: [опція конфігурації `assetsInclude`](/config/shared-options.md#assetsinclude)

## Імпорт ресурсу як URL

Імпорт статичного ресурсу поверне вирішений публічний URL, коли він буде обслуговуватися:

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl from './img.png'
document.getElementById('hero-img').src = imgUrl
```

Наприклад, `imgUrl` буде `/img.png` під час розробки, і стане `/assets/img.2d8efhg.png` у виробничій збірці.

Ця поведінка схожа на `file-loader` у webpack. Різниця полягає в тому, що імпорт може бути як з використанням абсолютних публічних шляхів (на основі кореня проекту під час розробки), так і відносних шляхів.

- Посилання `url()` у CSS обробляються так само.

- Якщо використовується плагін Vue, посилання на ресурси у шаблонах Vue SFC автоматично перетворюються на імпорти.

- Загальні типи файлів зображень, медіа та шрифтів автоматично визначаються як ресурси. Ви можете розширити внутрішній список за допомогою опції [`assetsInclude`](/config/shared-options.md#assetsinclude).

- Посилання на ресурси включаються як частина графу збірки ресурсів, отримують хешовані імена файлів і можуть оброблятися плагінами для оптимізації.

- Ресурси, менші за байтами, ніж опція [`assetsInlineLimit`](/config/build-options.md#build-assetsinlinelimit), будуть вбудовані як base64 data URL.

- Заповнювачі Git LFS автоматично виключаються з вбудовування, оскільки вони не містять вмісту файлу, який вони представляють. Щоб отримати вбудовування, переконайтеся, що ви завантажили вміст файлу через Git LFS перед збіркою.

- TypeScript за замовчуванням не розпізнає імпорт статичних ресурсів як дійсні модулі. Щоб виправити це, включіть [`vite/client`](./features#client-types).

::: tip Вбудовування SVG через `url()`
Коли передаєте URL SVG до вручну створеного `url()` за допомогою JS, змінну слід обгорнути в подвійні лапки.

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl from './img.svg'
document.getElementById('hero-img').style.background = `url("${imgUrl}")`
```

:::

### Явний імпорт URL

Ресурси, які не включені до внутрішнього списку або до `assetsInclude`, можуть бути явно імпортовані як URL за допомогою суфікса `?url`. Це корисно, наприклад, для імпорту [Houdini Paint Worklets](https://houdini.how/usage).

```js twoslash
import 'vite/client'
// ---cut---
import workletURL from 'extra-scalloped-border/worklet.js?url'
CSS.paintWorklet.addModule(workletURL)
```

### Явна обробка вбудовування

Ресурси можуть бути явно імпортовані з вбудовуванням або без вбудовування за допомогою суфіксів `?inline` або `?no-inline` відповідно.

```js twoslash
import 'vite/client'
// ---cut---
import imgUrl1 from './img.svg?no-inline'
import imgUrl2 from './img.png?inline'
```

### Імпорт ресурсу як рядка

Ресурси можуть бути імпортовані як рядки за допомогою суфікса `?raw`.

```js twoslash
import 'vite/client'
// ---cut---
import shaderString from './shader.glsl?raw'
```

### Імпорт скрипту як Worker

Скрипти можуть бути імпортовані як веб-воркери за допомогою суфіксів `?worker` або `?sharedworker`.

```js twoslash
import 'vite/client'
// ---cut---
// Окремий шматок у виробничій збірці
import Worker from './shader.js?worker'
const worker = new Worker()
```

```js twoslash
import 'vite/client'
// ---cut---
// sharedworker
import SharedWorker from './shader.js?sharedworker'
const sharedWorker = new SharedWorker()
```

```js twoslash
import 'vite/client'
// ---cut---
// Вбудовано як base64 рядки
import InlineWorker from './shader.js?worker&inline'
```

Перегляньте розділ [Web Worker](./features.md#web-workers) для отримання додаткової інформації.

## Директорія `public`

Якщо у вас є ресурси, які:

- Ніколи не згадуються в вихідному коді (наприклад, `robots.txt`)
- Повинні зберігати точно таку ж назву файлу (без хешування)
- ...або ви просто не хочете імпортувати ресурс спочатку, щоб отримати його URL

Тоді ви можете розмістити ресурс у спеціальній директорії `public` під коренем вашого проекту. Ресурси в цій директорії будуть обслуговуватися за кореневим шляхом `/` під час розробки і скопійовані до кореня директорії dist як є.

Директорія за замовчуванням `<root>/public`, але може бути налаштована за допомогою опції [`publicDir`](/config/shared-options.md#publicdir).

Зверніть увагу, що ви завжди повинні посилатися на ресурси `public` за допомогою абсолютного кореневого шляху - наприклад, `public/icon.png` слід згадувати у вихідному коді як `/icon.png`.

## new URL(url, import.meta.url)

[import.meta.url](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import.meta) - це нативна функція ESM, яка надає URL поточного модуля. Поєднуючи її з нативним [конструктором URL](https://developer.mozilla.org/en-US/docs/Web/API/URL), ми можемо отримати повний, вирішений URL статичного ресурсу, використовуючи відносний шлях з JavaScript модуля:

```js
const imgUrl = new URL('./img.png', import.meta.url).href

document.getElementById('hero-img').src = imgUrl
```

Це працює нативно в сучасних браузерах - насправді, Vite не потрібно обробляти цей код взагалі під час розробки!

Цей шаблон також підтримує динамічні URL через шаблонні літерали:

```js
function getImageUrl(name) {
  // зверніть увагу, що це не включає файли в підкаталогах
  return new URL(`./dir/${name}.png`, import.meta.url).href
}
```

Під час виробничої збірки Vite виконає необхідні перетворення, щоб URL все ще вказували на правильне місце навіть після збірки та хешування ресурсів. Однак, рядок URL повинен бути статичним, щоб його можна було проаналізувати, інакше код залишиться як є, що може спричинити помилки під час виконання, якщо `build.target` не підтримує `import.meta.url`.

```js
// Vite не буде перетворювати це
const imgUrl = new URL(imagePath, import.meta.url).href
```

::: details Як це працює

Vite перетворить функцію `getImageUrl` на:

```js
import __img0png from './dir/img0.png'
import __img1png from './dir/img1.png'

function getImageUrl(name) {
  const modules = {
    './dir/img0.png': __img0png,
    './dir/img1.png': __img1png,
  }
  return new URL(modules[`./dir/${name}.png`], import.meta.url).href
}
```

:::

::: warning Не працює з SSR
Цей шаблон не працює, якщо ви використовуєте Vite для серверного рендерингу, оскільки `import.meta.url` має різні семантики в браузерах та Node.js. Серверний бандл також не може визначити URL клієнтського хоста заздалегідь.
:::

