---
title: Налаштування Vite
---

# Налаштування Vite

При запуску `vite` з командного рядка, Vite автоматично спробує знайти файл конфігурації з назвою `vite.config.js` всередині [кореня проекту](/guide/#index-html-and-project-root) (також підтримуються інші розширення JS та TS).

Найбільш базовий файл конфігурації виглядає так:

```js
// vite.config.js
export default {
  // опції конфігурації
}
```

Зверніть увагу, що Vite підтримує використання синтаксису ES модулів у файлі конфігурації, навіть якщо проект не використовує нативний Node ESM, наприклад, `type: "module"` у `package.json`. У цьому випадку файл конфігурації автоматично попередньо обробляється перед завантаженням.

Ви також можете явно вказати файл конфігурації для використання з опцією CLI `--config` (вирішується відносно до `cwd`):

```bash
vite --config my-config.js
```

## Інтелісенс конфігурації

Оскільки Vite постачається з типами TypeScript, ви можете використовувати інтелісенс вашого IDE з підказками типів jsdoc:

```js
/** @type {import('vite').UserConfig} */
export default {
  // ...
}
```

Альтернативно, ви можете використовувати хелпер `defineConfig`, який повинен забезпечити інтелісенс без необхідності анотацій jsdoc:

```js
import { defineConfig } from 'vite'

export default defineConfig({
  // ...
})
```

Vite також підтримує файли конфігурації TypeScript. Ви можете використовувати `vite.config.ts` з функцією-хелпером `defineConfig`, або з оператором `satisfies`:

```ts
import type { UserConfig } from 'vite'

export default {
  // ...
} satisfies UserConfig
```

## Умовна конфігурація

Якщо конфігурація повинна умовно визначати опції на основі команди (`serve` або `build`), [режиму](/guide/env-and-mode), що використовується, якщо це збірка SSR (`isSsrBuild`), або попередній перегляд збірки (`isPreview`), вона може експортувати функцію:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig(({ command, mode, isSsrBuild, isPreview }) => {
  if (command === 'serve') {
    return {
      // конфігурація для розробки
    }
  } else {
    // команда === 'build'
    return {
      // конфігурація для збірки
    }
  }
})
```

Важливо зазначити, що в API Vite значення `command` є `serve` під час розробки (у CLI [`vite`](/guide/cli#vite), `vite dev` та `vite serve` є синонімами), і `build` при збірці для продакшн ([`vite build`](/guide/cli#vite-build)).

`isSsrBuild` та `isPreview` є додатковими необов'язковими прапорцями для розрізнення типу команд `build` та `serve` відповідно. Деякі інструменти, що завантажують конфігурацію Vite, можуть не підтримувати ці прапорці та передаватимуть `undefined` замість них. Тому рекомендується використовувати явне порівняння з `true` та `false`.

## Асинхронна конфігурація

Якщо конфігурація повинна викликати асинхронні функції, вона може експортувати асинхронну функцію. І ця асинхронна функція також може бути передана через `defineConfig` для покращеної підтримки інтелісенсу:

```js twoslash
import { defineConfig } from 'vite'
// ---cut---
export default defineConfig(async ({ command, mode }) => {
  const data = await asyncFunction()
  return {
    // конфігурація vite
  }
})
```

## Використання змінних середовища в конфігурації

Змінні середовища можуть бути отримані з `process.env` як зазвичай.

Зверніть увагу, що Vite не завантажує файли `.env` за замовчуванням, оскільки файли для завантаження можуть бути визначені лише після оцінки конфігурації Vite, наприклад, опції `root` та `envDir` впливають на поведінку завантаження. Однак, ви можете використовувати експортований хелпер `loadEnv` для завантаження конкретного файлу `.env`, якщо це необхідно.

```js twoslash
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // Завантажити файл env на основі `mode` в поточному робочому каталозі.
  // Встановіть третій параметр на '' для завантаження всіх env незалежно від
  // префіксу `VITE_`.
  const env = loadEnv(mode, process.cwd(), '')
  return {
    // конфігурація vite
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
```
