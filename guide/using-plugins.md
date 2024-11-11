# Використання плагінів

Vite можна розширювати за допомогою плагінів, які базуються на добре розробленому інтерфейсі плагінів Rollup з кількома додатковими опціями, специфічними для Vite. Це означає, що користувачі Vite можуть покладатися на зрілу екосистему плагінів Rollup, а також можуть розширювати функціональність dev-сервера та SSR за потреби.

## Додавання плагіна

Щоб використовувати плагін, його потрібно додати до `devDependencies` проекту та включити в масив `plugins` у конфігураційному файлі `vite.config.js`. Наприклад, для підтримки застарілих браузерів можна використовувати офіційний [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy):

```
$ npm add -D @vitejs/plugin-legacy
```

```js twoslash [vite.config.js]
import legacy from '@vitejs/plugin-legacy'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
```

`plugins` також приймає пресети, що включають кілька плагінів як один елемент. Це корисно для складних функцій (наприклад, інтеграції з фреймворками), які реалізуються за допомогою кількох плагінів. Масив буде внутрішньо розплющений.

Хибні плагіни будуть ігноруватися, що дозволяє легко активувати або деактивувати плагіни.

## Пошук плагінів

:::tip ПРИМІТКА
Vite прагне забезпечити підтримку загальних шаблонів веб-розробки "з коробки". Перед тим, як шукати плагін Vite або сумісний плагін Rollup, перегляньте [Посібник з функцій](../guide/features.md). Багато випадків, коли плагін був би потрібен у проекті Rollup, вже покриті у Vite.
:::

Перегляньте [Розділ плагінів](../plugins/) для отримання інформації про офіційні плагіни. Плагіни спільноти перераховані в [awesome-vite](https://github.com/vitejs/awesome-vite#plugins).

Ви також можете знайти плагіни, які дотримуються [рекомендованих конвенцій](./api-plugin.md#conventions), використовуючи [пошук npm для vite-plugin](https://www.npmjs.com/search?q=vite-plugin&ranking=popularity) для плагінів Vite або [пошук npm для rollup-plugin](https://www.npmjs.com/search?q=rollup-plugin&ranking=popularity) для плагінів Rollup.

## Примусове впорядкування плагінів

Для сумісності з деякими плагінами Rollup може знадобитися примусове впорядкування плагіна або його застосування лише під час збірки. Це має бути деталлю реалізації для плагінів Vite. Ви можете примусово встановити позицію плагіна за допомогою модифікатора `enforce`:

- `pre`: викликати плагін перед основними плагінами Vite
- за замовчуванням: викликати плагін після основних плагінів Vite
- `post`: викликати плагін після плагінів збірки Vite

```js twoslash [vite.config.js]
import image from '@rollup/plugin-image'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...image(),
      enforce: 'pre',
    },
  ],
})
```

Перегляньте [Посібник з API плагінів](./api-plugin.md#plugin-ordering) для отримання детальної інформації.

## Умовне застосування

За замовчуванням плагіни викликаються як для serve, так і для build. У випадках, коли плагін потрібно умовно застосовувати лише під час serve або build, використовуйте властивість `apply`, щоб викликати їх лише під час `'build'` або `'serve'`:

```js twoslash [vite.config.js]
import typescript2 from 'rollup-plugin-typescript2'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    {
      ...typescript2(),
      apply: 'build',
    },
  ],
})
```

## Створення плагінів

Перегляньте [Посібник з API плагінів](./api-plugin.md) для документації про створення плагінів.
