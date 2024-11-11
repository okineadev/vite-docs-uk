# Початок роботи

<audio id="vite-audio">
  <source src="/vite.mp3" type="audio/mpeg">
</audio>

## Огляд

Vite (французьке слово, що означає "швидко", вимовляється `/vit/`<button style="border:none;padding:3px;border-radius:4px;vertical-align:bottom" id="play-vite-audio" onclick="document.getElementById('vite-audio').play();"><svg style="height:2em;width:2em"><use href="/voice.svg#voice" /></svg></button>, як "віт") - це інструмент для збірки, який прагне забезпечити швидший та легший досвід розробки для сучасних веб-проєктів. Він складається з двох основних частин:

- Сервер розробки, який надає [багаті функціональні покращення](./features) над [нативними ES модулями](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules), наприклад, надзвичайно швидку [гарячу заміну модулів (HMR)](./features#hot-module-replacement).

- Команда збірки, яка збирає ваш код за допомогою [Rollup](https://rollupjs.org), попередньо налаштованого для виведення високоефективних статичних ресурсів для продакшну.

Vite є думковим і постачається з розумними налаштуваннями за замовчуванням. Дізнайтеся про можливості у [Посібнику з функцій](./features). Підтримка фреймворків або інтеграція з іншими інструментами можлива через [плагіни](./using-plugins). [Розділ конфігурації](../config/) пояснює, як адаптувати Vite до вашого проєкту, якщо це необхідно.

Vite також дуже розширюваний через [API плагінів](./api-plugin) та [JavaScript API](./api-javascript) з повною підтримкою типів.

Ви можете дізнатися більше про причини створення проєкту у розділі [Чому Vite](./why).

## Підтримка браузерів

Під час розробки Vite встановлює [`esnext` як ціль трансформації](https://esbuild.github.io/api/#target), оскільки ми припускаємо, що використовується сучасний браузер, який підтримує всі останні функції JavaScript та CSS. Це запобігає зниженню синтаксису, дозволяючи Vite обслуговувати модулі якомога ближче до оригінального вихідного коду.

Для продакшн-збірки Vite за замовчуванням орієнтується на браузери, які підтримують [нативні ES модулі](https://caniuse.com/es6-module), [нативний динамічний імпорт ESM](https://caniuse.com/es6-module-dynamic-import) та [`import.meta`](https://caniuse.com/mdn-javascript_operators_import_meta). Старі браузери можуть бути підтримані через офіційний [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy). Дивіться розділ [Збірка для продакшну](./build) для отримання додаткової інформації.

## Спробуйте Vite онлайн

Ви можете спробувати Vite онлайн на [StackBlitz](https://vite.new/). Він запускає налаштування збірки на основі Vite безпосередньо в браузері, тому це майже ідентично локальному налаштуванню, але не вимагає встановлення нічого на вашому комп'ютері. Ви можете перейти до `vite.new/{template}`, щоб вибрати, який фреймворк використовувати.

Підтримувані шаблони:

|             JavaScript              |                TypeScript                 |
| :---------------------------------: | :---------------------------------------: |
| [vanilla](https://vite.new/vanilla) | [vanilla-ts](https://vite.new/vanilla-ts) |
|     [vue](https://vite.new/vue)     |     [vue-ts](https://vite.new/vue-ts)     |
|   [react](https://vite.new/react)   |   [react-ts](https://vite.new/react-ts)   |
|  [preact](https://vite.new/preact)  |  [preact-ts](https://vite.new/preact-ts)  |
|     [lit](https://vite.new/lit)     |     [lit-ts](https://vite.new/lit-ts)     |
|  [svelte](https://vite.new/svelte)  |  [svelte-ts](https://vite.new/svelte-ts)  |
|   [solid](https://vite.new/solid)   |   [solid-ts](https://vite.new/solid-ts)   |
|    [qwik](https://vite.new/qwik)    |    [qwik-ts](https://vite.new/qwik-ts)    |

## Створення вашого першого проєкту на Vite

::: tip Примітка про сумісність
Vite вимагає [Node.js](https://nodejs.org/en/) версії 18+ або 20+. Однак деякі шаблони вимагають вищої версії Node.js для роботи, будь ласка, оновіть, якщо ваш менеджер пакетів попереджає про це.
:::

::: code-group

```bash [npm]
$ npm create vite@latest
```

```bash [Yarn]
$ yarn create vite
```

```bash [pnpm]
$ pnpm create vite
```

```bash [Bun]
$ bun create vite
```

:::

Потім дотримуйтесь підказок!

Ви також можете безпосередньо вказати назву проєкту та шаблон, який хочете використовувати, за допомогою додаткових параметрів командного рядка. Наприклад, щоб створити проєкт Vite + Vue, виконайте:

::: code-group

```bash [npm]
# npm 7+, потрібен додатковий подвійний дефіс:
$ npm create vite@latest my-vue-app -- --template vue
```

```bash [Yarn]
$ yarn create vite my-vue-app --template vue
```

```bash [pnpm]
$ pnpm create vite my-vue-app --template vue
```

```bash [Bun]
$ bun create vite my-vue-app --template vue
```

:::

Дивіться [create-vite](https://github.com/vitejs/vite/tree/main/packages/create-vite) для отримання додаткової інформації про кожен підтримуваний шаблон: `vanilla`, `vanilla-ts`, `vue`, `vue-ts`, `react`, `react-ts`, `react-swc`, `react-swc-ts`, `preact`, `preact-ts`, `lit`, `lit-ts`, `svelte`, `svelte-ts`, `solid`, `solid-ts`, `qwik`, `qwik-ts`.

Ви можете використовувати `.` для назви проєкту, щоб створити його в поточному каталозі.

## Шаблони спільноти

create-vite - це інструмент для швидкого запуску проєкту з базового шаблону для популярних фреймворків. Перегляньте Awesome Vite для [шаблонів, підтримуваних спільнотою](https://github.com/vitejs/awesome-vite#templates), які включають інші інструменти або орієнтовані на різні фреймворки.

Для шаблону на `https://github.com/user/project` ви можете спробувати його онлайн, використовуючи `https://github.stackblitz.com/user/project` (додавши `.stackblitz` після `github` до URL проєкту).

Ви також можете використовувати інструмент, такий як [degit](https://github.com/Rich-Harris/degit), щоб створити ваш проєкт з одного з шаблонів. Припускаючи, що проєкт знаходиться на GitHub і використовує `main` як основну гілку, ви можете створити локальну копію, використовуючи:

```bash
npx degit user/project#main my-project
cd my-project

npm install
npm run dev
```

## Ручне встановлення

У вашому проєкті ви можете встановити CLI `vite`, використовуючи:

::: code-group

```bash [npm]
$ npm install -D vite
```

```bash [Yarn]
$ yarn add -D vite
```

```bash [pnpm]
$ pnpm add -D vite
```

```bash [Bun]
$ bun add -D vite
```

:::

І створіть файл `index.html` такого вигляду:

```html
<p>Привіт, Vite!</p>
```

Потім виконайте відповідну команду CLI у вашому терміналі:

::: code-group

```bash [npm]
$ npx vite
```

```bash [Yarn]
$ yarn vite
```

```bash [pnpm]
$ pnpm vite
```

```bash [Bun]
$ bunx vite
```

:::

Файл `index.html` буде обслуговуватися на `http://localhost:5173`.

## `index.html` та корінь проєкту

Одне, що ви могли помітити, це те, що у проєкті Vite `index.html` знаходиться на передньому плані, а не захований всередині `public`. Це навмисно: під час розробки Vite є сервером, і `index.html` є точкою входу до вашого застосунку.

Vite розглядає `index.html` як вихідний код і частину графу модулів. Він вирішує `<script type="module" src="...">`, що посилається на ваш вихідний код JavaScript. Навіть вбудовані `<script type="module">` та CSS, на які посилаються через `<link href>`, також користуються специфічними функціями Vite. Крім того, URL-адреси всередині `index.html` автоматично переробляються, тому немає потреби у спеціальних заповнювачах `%PUBLIC_URL%`.

Подібно до статичних HTTP-серверів, Vite має концепцію "кореневого каталогу", з якого обслуговуються ваші файли. Ви побачите його згадування як `<root>` у решті документації. Абсолютні URL-адреси у вашому вихідному коді будуть вирішуватися, використовуючи корінь проєкту як базу, тому ви можете писати код так, ніби працюєте з нормальним статичним файловим сервером (але набагато потужнішим!). Vite також здатний обробляти залежності, які вирішуються до розташувань файлової системи поза коренем, що робить його придатним навіть у налаштуванні на основі монорепозиторію.

Vite також підтримує [багатосторінкові застосунки](./build#multi-page-app) з кількома точками входу `.html`.

#### Вказівка альтернативного кореня

Запуск `vite` запускає сервер розробки, використовуючи поточний робочий каталог як корінь. Ви можете вказати альтернативний корінь за допомогою `vite serve some/sub/dir`.
Зверніть увагу, що Vite також вирішуватиме [свій конфігураційний файл (тобто `vite.config.js`)](/config/#configuring-vite) всередині кореня проєкту, тому вам потрібно буде перемістити його, якщо корінь змінено.

## Інтерфейс командного рядка

У проєкті, де встановлено Vite, ви можете використовувати бінарний файл `vite` у ваших npm-скриптах або запускати його безпосередньо за допомогою `npx vite`. Ось стандартні npm-скрипти у створеному проєкті Vite:

<!-- prettier-ignore -->
```json [package.json]
{
  "scripts": {
    "dev": "vite", // запуск сервера розробки, псевдоніми: `vite dev`, `vite serve`
    "build": "vite build", // збірка для продакшну
    "preview": "vite preview" // локальний перегляд збірки для продакшну
  }
}
```

Ви можете вказати додаткові параметри CLI, такі як `--port` або `--open`. Для повного списку параметрів CLI виконайте `npx vite --help` у вашому проєкті.

Дізнайтеся більше про [інтерфейс командного рядка](./cli.md)

## Використання невипущених комітів

Якщо ви не можете дочекатися нового випуску, щоб протестувати останні функції, вам потрібно буде клонувати [репозиторій vite](https://github.com/vitejs/vite) на ваш локальний комп'ютер, а потім зібрати та зв'язати його самостійно (потрібен [pnpm](https://pnpm.io/)):

```bash
git clone https://github.com/vitejs/vite.git
cd vite
pnpm install
cd packages/vite
pnpm run build
pnpm link --global # використовуйте ваш улюблений менеджер пакетів для цього кроку
```

Потім перейдіть до вашого проєкту на основі Vite і виконайте `pnpm link --global vite` (або менеджер пакетів, який ви використовували для глобального зв'язування `vite`). Тепер перезапустіть сервер розробки, щоб бути на передовій!

## Спільнота

Якщо у вас є питання або потрібна допомога, зверніться до спільноти на [Discord](https://chat.vite.dev) та [GitHub Discussions](https://github.com/vitejs/vite/discussions).
