# Особливості

На базовому рівні розробка з використанням Vite не дуже відрізняється від використання статичного файлового сервера. Однак, Vite надає багато покращень над нативними ESM імпортами для підтримки різних функцій, які зазвичай зустрічаються в налаштуваннях на основі збирачів.

## Розв'язання та попереднє збирання залежностей npm

Нативні ES імпорти не підтримують імпорти модулів без вказання шляху, як у наступному прикладі:

```js
import { someMethod } from 'my-dep'
```

Вищенаведений код викличе помилку в браузері. Vite виявить такі імпорти модулів у всіх обслуговуваних вихідних файлах і виконає наступне:

1. [Попередньо збере](./dep-pre-bundling) їх для покращення швидкості завантаження сторінки та перетворить модулі CommonJS / UMD на ESM. Попереднє збирання виконується за допомогою [esbuild](http://esbuild.github.io/), що значно прискорює час холодного старту Vite порівняно з будь-яким збирачем на основі JavaScript.

2. Перепише імпорти на дійсні URL-адреси, такі як `/node_modules/.vite/deps/my-dep.js?v=f3sf2ebd`, щоб браузер міг їх правильно імпортувати.

**Залежності сильно кешуються**

Vite кешує запити залежностей за допомогою HTTP заголовків, тому якщо ви хочете локально редагувати/налагоджувати залежність, дотримуйтесь інструкцій [тут](./dep-pre-bundling#browser-cache).

## Гаряча заміна модулів

Vite надає [HMR API](./api-hmr) поверх нативного ESM. Фреймворки з можливостями HMR можуть використовувати API для забезпечення миттєвих, точних оновлень без перезавантаження сторінки або втрати стану додатку. Vite надає перші інтеграції HMR для [Vue Single File Components](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue) та [React Fast Refresh](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react). Також є офіційні інтеграції для Preact через [@prefresh/vite](https://github.com/JoviDeCroock/prefresh/tree/main/packages/vite).

Зверніть увагу, що вам не потрібно налаштовувати це вручну - коли ви [створюєте додаток через `create-vite`](./), вибрані шаблони вже будуть попередньо налаштовані для вас.

## TypeScript

Vite підтримує імпорт `.ts` файлів з коробки.

### Тільки транспіляція

Зверніть увагу, що Vite виконує тільки транспіляцію `.ts` файлів і **НЕ** виконує перевірку типів. Передбачається, що перевірка типів виконується вашим IDE та процесом збірки.

Причина, чому Vite не виконує перевірку типів як частину процесу трансформації, полягає в тому, що ці дві задачі працюють принципово по-різному. Транспіляція може працювати на основі окремих файлів і ідеально підходить для моделі компіляції на вимогу Vite. У порівнянні, перевірка типів вимагає знання всієї графіки модулів. Включення перевірки типів у конвеєр трансформації Vite неминуче знизить швидкість Vite.

Завдання Vite - якнайшвидше перетворити ваші вихідні модулі у форму, яка може виконуватися в браузері. З цією метою ми рекомендуємо відокремити статичні перевірки від конвеєра трансформації Vite. Цей принцип застосовується до інших статичних перевірок, таких як ESLint.

- Для виробничих збірок ви можете виконати `tsc --noEmit` додатково до команди збірки Vite.

- Під час розробки, якщо вам потрібні більше, ніж підказки IDE, ми рекомендуємо виконувати `tsc --noEmit --watch` у окремому процесі або використовувати [vite-plugin-checker](https://github.com/fi3ework/vite-plugin-checker), якщо ви віддаєте перевагу отримувати повідомлення про помилки типів безпосередньо в браузері.

Vite використовує [esbuild](https://github.com/evanw/esbuild) для транспіляції TypeScript у JavaScript, що приблизно в 20~30 разів швидше, ніж звичайний `tsc`, і оновлення HMR можуть відображатися в браузері менш ніж за 50 мс.

Використовуйте синтаксис [Type-Only Imports and Export](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-8.html#type-only-imports-and-export), щоб уникнути потенційних проблем, таких як неправильне збирання імпортів тільки типів, наприклад:

```ts
import type { T } from 'only/types'
export type { T }
```

### Опції компілятора TypeScript

Деякі поля конфігурації під `compilerOptions` у `tsconfig.json` потребують особливої уваги.

#### `isolatedModules`

- [Документація TypeScript](https://www.typescriptlang.org/tsconfig#isolatedModules)

Повинно бути встановлено на `true`.

Це тому, що `esbuild` виконує тільки транспіляцію без інформації про типи, він не підтримує певні функції, такі як const enum та неявні імпорти тільки типів.

Ви повинні встановити `"isolatedModules": true` у вашому `tsconfig.json` під `compilerOptions`, щоб TS попереджав вас про функції, які не працюють з ізольованою транспіляцією.

Якщо залежність не працює добре з `"isolatedModules": true`, ви можете тимчасово придушити помилки, використовуючи `"skipLibCheck": true`, поки це не буде виправлено вгору за течією.

#### `useDefineForClassFields`

- [Документація TypeScript](https://www.typescriptlang.org/tsconfig#useDefineForClassFields)

Починаючи з Vite 2.5.0, значення за замовчуванням буде `true`, якщо ціль TypeScript - `ESNext` або `ES2022` або новіше. Це узгоджується з [поведінкою `tsc` 4.3.2 і пізніших версій](https://github.com/microsoft/TypeScript/pull/42663). Це також стандартна поведінка ECMAScript.

Інші цілі TypeScript за замовчуванням будуть `false`.

Але це може бути неінтуїтивно для тих, хто переходить з інших мов програмування або старіших версій TypeScript.
Ви можете дізнатися більше про перехід у [примітках до випуску TypeScript 3.7](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier).

Якщо ви використовуєте бібліотеку, яка сильно залежить від полів класу, будьте обережні щодо її призначеного використання.

Більшість бібліотек очікують `"useDefineForClassFields": true`, таких як [MobX](https://mobx.js.org/installation.html#use-spec-compliant-transpilation-for-class-properties).

Але деякі бібліотеки ще не перейшли на цей новий стандарт, включаючи [`lit-element`](https://github.com/lit/lit-element/issues/1030). У таких випадках, будь ласка, явно встановіть `useDefineForClassFields` на `false`.

#### `target`

- [Документація TypeScript](https://www.typescriptlang.org/tsconfig#target)

Vite ігнорує значення `target` у `tsconfig.json`, дотримуючись тієї ж поведінки, що й `esbuild`.

Щоб вказати ціль у режимі розробки, можна використовувати опцію [`esbuild.target`](/config/shared-options.html#esbuild), яка за замовчуванням встановлена на `esnext` для мінімальної транспіляції. У збірках опція [`build.target`](/config/build-options.html#build-target) має вищий пріоритет над `esbuild.target` і також може бути встановлена, якщо це необхідно.

::: попередження `useDefineForClassFields`

Якщо `target` у `tsconfig.json` не `ESNext` або `ES2022` або новіше, або якщо немає файлу `tsconfig.json`, `useDefineForClassFields` за замовчуванням буде `false`, що може бути проблематичним з значенням за замовчуванням `esbuild.target` `esnext`. Це може призвести до транспіляції в [статичні блоки ініціалізації](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks#browser_compatibility), які можуть не підтримуватися вашим браузером.

Тому рекомендується встановити `target` на `ESNext` або `ES2022` або новіше, або явно встановити `useDefineForClassFields` на `true` при налаштуванні `tsconfig.json`.
:::

#### Інші опції компілятора, що впливають на результат збірки

- [`extends`](https://www.typescriptlang.org/tsconfig#extends)
- [`importsNotUsedAsValues`](https://www.typescriptlang.org/tsconfig#importsNotUsedAsValues)
- [`preserveValueImports`](https://www.typescriptlang.org/tsconfig#preserveValueImports)
- [`verbatimModuleSyntax`](https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax)
- [`jsx`](https://www.typescriptlang.org/tsconfig#jsx)
- [`jsxFactory`](https://www.typescriptlang.org/tsconfig#jsxFactory)
- [`jsxFragmentFactory`](https://www.typescriptlang.org/tsconfig#jsxFragmentFactory)
- [`jsxImportSource`](https://www.typescriptlang.org/tsconfig#jsxImportSource)
- [`experimentalDecorators`](https://www.typescriptlang.org/tsconfig#experimentalDecorators)
- [`alwaysStrict`](https://www.typescriptlang.org/tsconfig#alwaysStrict)

:::tip `skipLibCheck`
Шаблони стартових проектів Vite мають `"skipLibCheck": "true"` за замовчуванням, щоб уникнути перевірки типів залежностей, оскільки вони можуть підтримувати лише певні версії та конфігурації TypeScript. Ви можете дізнатися більше на [vuejs/vue-cli#5688](https://github.com/vuejs/vue-cli/pull/5688).
:::

### Типи клієнта

Типи за замовчуванням Vite призначені для його Node.js API. Щоб додати середовище для коду на стороні клієнта в додатку Vite, додайте файл декларації `d.ts`:

```typescript
/// <reference types="vite/client" />
```

Альтернативно, ви можете додати `vite/client` до `compilerOptions.types` у `tsconfig.json`:

```json [tsconfig.json]
{
  "compilerOptions": {
    "types": ["vite/client"]
  }
}
```

Це надасть наступні типові шими:

- Імпорти активів (наприклад, імпорт `.svg` файлу)
- Типи для змінних середовища, введених Vite, на `import.meta.env`
- Типи для [HMR API](./api-hmr) на `import.meta.hot`

:::tip ПОРАДА

Щоб перевизначити типи за замовчуванням, додайте файл визначення типів, що містить ваші типи. Потім додайте посилання на тип перед `vite/client`.

Наприклад, щоб зробити імпорт за замовчуванням `*.svg` компонентом React:

- `vite-env-override.d.ts` (файл, що містить ваші типи):

  ```ts
  declare module '*.svg' {
    const content: React.FC<React.SVGProps<SVGElement>>
    export default content
  }
  ```

- Файл, що містить посилання на `vite/client`:

  ```ts
  /// <reference types="./vite-env-override.d.ts" />
  /// <reference types="vite/client" />
  ```

:::

## HTML

HTML файли знаходяться [в центрі уваги](/guide/#index-html-and-project-root) проекту Vite, слугуючи точками входу для вашого додатку, що робить простим створення односторінкових та [багатосторінкових додатків](/guide/build.html#multi-page-app).

Будь-які HTML файли у кореневій директорії вашого проекту можуть бути безпосередньо доступні за відповідним шляхом:

- `<root>/index.html` -> `http://localhost:5173/`
- `<root>/about.html` -> `http://localhost:5173/about.html`
- `<root>/blog/index.html` -> `http://localhost:5173/blog/index.html`

Активи, на які посилаються HTML елементи, такі як `<script type="module" src>` та `<link href>`, обробляються та збираються як частина додатку. Повний список підтримуваних елементів наведено нижче:

- `<audio src>`
- `<embed src>`
- `<img src>` та `<img srcset>`
- `<image src>`
- `<input src>`
- `<link href>` та `<link imagesrcset>`
- `<object data>`
- `<script type="module" src>`
- `<source src>` та `<source srcset>`
- `<track src>`
- `<use href>` та `<use xlink:href>`
- `<video src>` та `<video poster>`
- `<meta content>`
  - Тільки якщо атрибут `name` відповідає `msapplication-tileimage`, `msapplication-square70x70logo`, `msapplication-square150x150logo`, `msapplication-wide310x150logo`, `msapplication-square310x310logo`, `msapplication-config`, або `twitter:image`
  - Або тільки якщо атрибут `property` відповідає `og:image`, `og:image:url`, `og:image:secure_url`, `og:audio`, `og:audio:secure_url`, `og:video`, або `og:video:secure_url`

```html {4-5,8-9}
<!doctype html>
<html>
  <head>
    <link rel="icon" href="/favicon.ico" />
    <link rel="stylesheet" href="/src/styles.css" />
  </head>
  <body>
    <img src="/src/images/logo.svg" alt="logo" />
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

Щоб відмовитися від обробки HTML на певних елементах, ви можете додати атрибут `vite-ignore` на елемент, що може бути корисним при посиланні на зовнішні активи або CDN.

## Vue

Vite надає першокласну підтримку Vue:

- Підтримка Vue 3 SFC через [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)
- Підтримка Vue 3 JSX через [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)
- Підтримка Vue 2.7 SFC через [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)
- Підтримка Vue 2.7 JSX через [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

## JSX

Файли `.jsx` та `.tsx` також підтримуються з коробки. Транспіляція JSX також обробляється через [esbuild](https://esbuild.github.io).

Користувачам Vue слід використовувати офіційний плагін [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx), який надає специфічні для Vue 3 функції, включаючи HMR, глобальне вирішення компонентів, директиви та слоти.

Якщо ви використовуєте JSX без React або Vue, ви можете налаштувати власні `jsxFactory` та `jsxFragment` за допомогою опції [`esbuild`](/config/shared-options.md#esbuild). Наприклад, для Preact:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
})
```

Детальніше в [документації esbuild](https://esbuild.github.io/content-types/#jsx).

Ви можете інжектувати JSX хелпери за допомогою `jsxInject` (що є опцією тільки для Vite), щоб уникнути ручного імпорту:

```js twoslash [vite.config.js]
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxInject: `import React from 'react'`,
  },
})
```

## CSS

Імпорт `.css` файлів буде інжектувати їх вміст на сторінку через тег `<style>` з підтримкою HMR.

### Інлайнінг та ребазування `@import`

Vite попередньо налаштований для підтримки інлайнінгу CSS `@import` через `postcss-import`. Аліаси Vite також враховуються для CSS `@import`. Крім того, всі посилання CSS `url()`, навіть якщо імпортовані файли знаходяться в різних директоріях, завжди автоматично ребазуються для забезпечення коректності.

Аліаси `@import` та ребазування URL також підтримуються для файлів Sass та Less (див. [CSS препроцесори](#css-препроцесори)).

### PostCSS

Якщо проект містить дійсну конфігурацію PostCSS (будь-який формат, підтримуваний [postcss-load-config](https://github.com/postcss/postcss-load-config), наприклад, `postcss.config.js`), вона буде автоматично застосована до всіх імпортованих CSS.

Зверніть увагу, що мінімізація CSS буде виконуватися після PostCSS і буде використовувати опцію [`build.cssTarget`](/config/build-options.md#build-csstarget).

### CSS модулі

Будь-який CSS файл, що закінчується на `.module.css`, вважається [файлом CSS модулів](https://github.com/css-modules/css-modules). Імпорт такого файлу поверне відповідний об'єкт модуля:

```css [example.module.css]
.red {
  color: red;
}
```

```js twoslash
import 'vite/client'
// ---cut---
import classes from './example.module.css'
document.getElementById('foo').className = classes.red
```

Поведінка CSS модулів може бути налаштована через опцію [`css.modules`](/config/shared-options.md#css-modules).

Якщо `css.modules.localsConvention` встановлено для увімкнення camelCase локалів (наприклад, `localsConvention: 'camelCaseOnly'`), ви також можете використовувати іменовані імпорти:

```js twoslash
import 'vite/client'
// ---cut---
// .apply-color -> applyColor
import { applyColor } from './example.module.css'
document.getElementById('foo').className = applyColor
```

### CSS препроцесори

Оскільки Vite орієнтований тільки на сучасні браузери, рекомендується використовувати нативні CSS змінні з плагінами PostCSS, які реалізують чернетки CSSWG (наприклад, [postcss-nesting](https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-nesting)) та писати простий, відповідний майбутнім стандартам CSS.

Тим не менш, Vite надає вбудовану підтримку для файлів `.scss`, `.sass`, `.less`, `.styl` та `.stylus`. Немає необхідності встановлювати специфічні для Vite плагіни для них, але сам препроцесор повинен бути встановлений:

```bash
# .scss та .sass
npm add -D sass-embedded # або sass

# .less
npm add -D less

# .styl та .stylus
npm add -D stylus
```

Якщо ви використовуєте Vue компоненти з одним файлом, це також автоматично увімкне `<style lang="sass">` та інші.

Vite покращує вирішення `@import` для Sass та Less, щоб враховувалися також аліаси Vite. Крім того, відносні посилання `url()` всередині імпортованих файлів Sass/Less, які знаходяться в різних директоріях від кореневого файлу, також автоматично ребазуються для забезпечення коректності.

Аліаси `@import` та ребазування URL не підтримуються для Stylus через обмеження його API.

Ви також можете використовувати CSS модулі в поєднанні з препроцесорами, додаючи `.module` до розширення файлу, наприклад, `style.module.scss`.

### Вимкнення інжекції CSS на сторінку

Автоматичну інжекцію вмісту CSS можна вимкнути за допомогою параметра запиту `?inline`. У цьому випадку оброблений рядок CSS повертається як стандартний експорт модуля, як зазвичай, але стилі не інжектуються на сторінку.

```js twoslash
import 'vite/client'
// ---cut---
import './foo.css' // буде інжектовано на сторінку
import otherStyles from './bar.css?inline' // не буде інжектовано
```

::: tip NOTE
Стандартні та іменовані імпорти з CSS файлів (наприклад, `import style from './foo.css'`) видалені з Vite 5. Використовуйте параметр запиту `?inline` замість цього.
:::

### Lightning CSS

Починаючи з Vite 4.4, є експериментальна підтримка [Lightning CSS](https://lightningcss.dev/). Ви можете увімкнути її, додавши [`css.transformer: 'lightningcss'`](../config/shared-options.md#css-transformer) до вашого конфігураційного файлу та встановивши додаткову залежність [`lightningcss`](https://www.npmjs.com/package/lightningcss):

```bash
npm add -D lightningcss
```

Якщо увімкнено, CSS файли будуть оброблятися Lightning CSS замість PostCSS. Щоб налаштувати його, ви можете передати опції Lightning CSS до конфігураційної опції [`css.lightningcss`](../config/shared-options.md#css-lightningcss).

Для налаштування CSS модулів, ви будете використовувати [`css.lightningcss.cssModules`](https://lightningcss.dev/css-modules.html) замість [`css.modules`](../config/shared-options.md#css-modules) (яка налаштовує спосіб обробки CSS модулів PostCSS).

За замовчуванням, Vite використовує esbuild для мінімізації CSS. Lightning CSS також може бути використаний як мінімізатор CSS за допомогою [`build.cssMinify: 'lightningcss'`](../config/build-options.md#build-cssminify).

::: tip NOTE
[CSS препроцесори](#css-препроцесори) не підтримуються при використанні Lightning CSS.
:::

### Особливості імпорту за шаблоном

Зверніть увагу, що:

- Це функція, яка підтримується тільки Vite і не є стандартом веб або ES.
- Шаблони обробляються як специфікатори імпорту: вони повинні бути або відносними (починатися з `./`), або абсолютними (починатися з `/`, відносно кореня проекту), або шляхами з псевдонімами (див. опцію [`resolve.alias`](/config/shared-options.md#resolve-alias)).
- Відповідність шаблону здійснюється за допомогою [`tinyglobby`](https://github.com/SuperchupuDev/tinyglobby).
- Ви також повинні знати, що всі аргументи в `import.meta.glob` повинні бути **передані як літерали**. Ви НЕ можете використовувати змінні або вирази в них.

## Динамічний імпорт

Подібно до [імпорту за шаблоном](#особливості-імпорту-за-шаблоном), Vite також підтримує динамічний імпорт зі змінними.

```ts
const module = await import(`./dir/${file}.js`)
```

Зверніть увагу, що змінні представляють лише імена файлів на одному рівні. Якщо `file` є `'foo/bar'`, імпорт не вдасться. Для більш складного використання ви можете скористатися функцією [імпорту за шаблоном](#glob-import).

## WebAssembly

Попередньо скомпільовані файли `.wasm` можна імпортувати з `?init`.
Експорт за замовчуванням буде функцією ініціалізації, яка повертає Promise з [`WebAssembly.Instance`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/Instance):

```js twoslash
import 'vite/client'
// ---cut---
import init from './example.wasm?init'

init().then((instance) => {
  instance.exports.test()
})
```

Функція ініціалізації також може приймати об'єкт імпорту, який передається до [`WebAssembly.instantiate`](https://developer.mozilla.org/en-US/docs/WebAssembly/JavaScript_interface/instantiate) як другий аргумент:

```js twoslash
import 'vite/client'
import init from './example.wasm?init'
// ---cut---
init({
  imports: {
    someFunc: () => {
      /* ... */
    },
  },
}).then(() => {
  /* ... */
})
```

У виробничій збірці файли `.wasm`, менші за `assetInlineLimit`, будуть вбудовані як рядки base64. В іншому випадку вони будуть оброблятися як [статичні активи](./assets) і завантажуватися за запитом.

::: tip ПРИМІТКА
[Пропозиція інтеграції ES Module для WebAssembly](https://github.com/WebAssembly/esm-integration) наразі не підтримується.
Використовуйте [`vite-plugin-wasm`](https://github.com/Menci/vite-plugin-wasm) або інші плагіни спільноти для обробки цього.
:::

### Доступ до модуля WebAssembly

Якщо вам потрібен доступ до об'єкта `Module`, наприклад, для його багаторазової ініціалізації, використовуйте [явний імпорт URL](./assets#explicit-url-imports) для вирішення активу, а потім виконайте ініціалізацію:

```js twoslash
import 'vite/client'
// ---cut---
import wasmUrl from 'foo.wasm?url'

const main = async () => {
  const responsePromise = fetch(wasmUrl)
  const { module, instance } =
    await WebAssembly.instantiateStreaming(responsePromise)
  /* ... */
}

main()
```

### Завантаження модуля в Node.js

У SSR, `fetch()`, що виконується як частина імпорту `?init`, може завершитися помилкою `TypeError: Invalid URL`.
Дивіться проблему [Підтримка wasm у SSR](https://github.com/vitejs/vite/issues/8882).

Ось альтернатива, припускаючи, що базовий проект знаходиться в поточній директорії:

```js twoslash
import 'vite/client'
// ---cut---
import wasmUrl from 'foo.wasm?url'
import { readFile } from 'node:fs/promises'

const main = async () => {
  const resolvedUrl = (await import('./test/boot.test.wasm?url')).default
  const buffer = await readFile('.' + resolvedUrl)
  const { instance } = await WebAssembly.instantiate(buffer, {
    /* ... */
  })
  /* ... */
}

main()
```

## Веб-працівники

### Імпорт з конструкторами

Скрипт веб-працівника можна імпортувати за допомогою [`new Worker()`](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker) та [`new SharedWorker()`](https://developer.mozilla.org/en-US/docs/Web/API/SharedWorker/SharedWorker). Порівняно з суфіксами працівників, цей синтаксис ближчий до стандартів і є **рекомендованим** способом створення працівників.

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url))
```

Конструктор працівника також приймає опції, які можна використовувати для створення "модульних" працівників:

```ts
const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
})
```

Виявлення працівника працюватиме лише в тому випадку, якщо конструктор `new URL()` використовується безпосередньо всередині декларації `new Worker()`. Крім того, всі параметри опцій повинні бути статичними значеннями (тобто рядковими літералами).

### Імпорт з суфіксами запиту

Скрипт веб-працівника можна безпосередньо імпортувати, додавши `?worker` або `?sharedworker` до запиту імпорту. Експорт за замовчуванням буде спеціальним конструктором працівника:

```js twoslash
import 'vite/client'
// ---cut---
import MyWorker from './worker?worker'

const worker = new MyWorker()
```

Скрипт працівника також може використовувати ESM `import` замість `importScripts()`. **Примітка**: Під час розробки це покладається на [нативну підтримку браузера](https://caniuse.com/?search=module%20worker), але для виробничої збірки це компілюється.

За замовчуванням скрипт працівника буде випущений як окремий фрагмент у виробничій збірці. Якщо ви хочете вбудувати працівника як рядки base64, додайте запит `inline`:

```js twoslash
import 'vite/client'
// ---cut---
import MyWorker from './worker?worker&inline'
```

Якщо ви хочете отримати працівника як URL, додайте запит `url`:

```js twoslash
import 'vite/client'
// ---cut---
import MyWorker from './worker?worker&url'
```

Дивіться [Worker Options](/config/worker-options.md) для деталей налаштування збірки всіх працівників.

## Політика безпеки контенту (CSP)

Для розгортання CSP необхідно встановити певні директиви або конфігурації через внутрішні механізми Vite.

### [`'nonce-{RANDOM}'`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#nonce-base64-value)

Коли встановлено [`html.cspNonce`](/config/shared-options#html-cspnonce), Vite додає атрибут nonce зі вказаним значенням до будь-яких тегів `<script>` та `<style>`, а також до тегів `<link>` для стилів та попереднього завантаження модулів. Крім того, коли ця опція встановлена, Vite вставляє мета-тег (`<meta property="csp-nonce" nonce="PLACEHOLDER" />`).

Значення nonce мета-тега з `property="csp-nonce"` буде використовуватися Vite за необхідності під час розробки та після збірки.

:::warning
Переконайтеся, що ви замінюєте заповнювач унікальним значенням для кожного запиту. Це важливо для запобігання обходу політики ресурсу, що інакше може бути легко зроблено.
:::

### [`data:`](<https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/Sources#scheme-source:~:text=schemes%20(not%20recommended).-,data%3A,-Allows%20data%3A>)

За замовчуванням, під час збірки Vite вбудовує невеликі активи як URI даних. Дозволення `data:` для відповідних директив (наприклад, [`img-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/img-src), [`font-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/font-src)), або відключення цього, встановивши [`build.assetsInlineLimit: 0`](/config/build-options#build-assetsinlinelimit), є необхідним.

:::warning
Не дозволяйте `data:` для [`script-src`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src). Це дозволить інжекцію довільних скриптів.
:::

## Оптимізації збірки

> Функції, наведені нижче, автоматично застосовуються як частина процесу збірки, і немає необхідності в явній конфігурації, якщо ви не хочете їх відключити.

### Розділення CSS коду

Vite автоматично витягує CSS, що використовується модулями в асинхронному фрагменті, і генерує окремий файл для нього. CSS файл автоматично завантажується через тег `<link>`, коли завантажується відповідний асинхронний фрагмент, і асинхронний фрагмент гарантовано буде оцінений тільки після завантаження CSS, щоб уникнути [FOUC](https://en.wikipedia.org/wiki/Flash_of_unstyled_content#:~:text=A%20flash%20of%20unstyled%20content,before%20all%20information%20is%20retrieved.).

Якщо ви віддаєте перевагу, щоб весь CSS був витягнутий в один файл, ви можете відключити розділення CSS коду, встановивши [`build.cssCodeSplit`](/config/build-options.md#build-csscodesplit) на `false`.

### Генерація директив попереднього завантаження

Vite автоматично генерує директиви `<link rel="modulepreload">` для вхідних фрагментів та їх прямих імпортів у зібраному HTML.

### Оптимізація завантаження асинхронних фрагментів

У реальних додатках Rollup часто генерує "загальні" фрагменти - код, який використовується двома або більше іншими фрагментами. У поєднанні з динамічними імпортами, досить часто зустрічається наступний сценарій:

```html
<script setup>
import graphSvg from '../images/graph.svg?raw'
</script>
<svg-image :svg="graphSvg" />
```

У неоптимізованих сценаріях, коли імпортується асинхронний фрагмент `A`, браузеру доведеться запитати та розібрати `A`, перш ніж він зможе зрозуміти, що йому також потрібен загальний фрагмент `C`. Це призводить до додаткового мережевого запиту:

```
Entry ---> A ---> C
```

Vite автоматично переписує виклики динамічного імпорту з розділенням коду з кроком попереднього завантаження, щоб коли запитується `A`, `C` завантажувався **паралельно**:

```
Entry ---> (A + C)
```

Можливо, що `C` має подальші імпорти, що призведе до ще більшої кількості запитів у неоптимізованому сценарії. Оптимізація Vite відстежує всі прямі імпорти, щоб повністю усунути додаткові запити незалежно від глибини імпорту.
