# HMR API

:::tip Примітка
Це клієнтський HMR API. Для обробки оновлень HMR у плагінах дивіться [handleHotUpdate](./api-plugin#handlehotupdate).

Ручний HMR API в основному призначений для авторів фреймворків та інструментів. Як кінцевий користувач, HMR, ймовірно, вже обробляється для вас у шаблонах стартових проектів, специфічних для фреймворку.
:::

Vite надає свій ручний HMR API через спеціальний об'єкт `import.meta.hot`:

```ts twoslash
import type { ModuleNamespace } from 'vite/types/hot.d.ts'
import type { InferCustomEventPayload } from 'vite/types/customEvent.d.ts'

// ---cut---
interface ImportMeta {
  readonly hot?: ViteHotContext
}

interface ViteHotContext {
  readonly data: any

  accept(): void
  accept(cb: (mod: ModuleNamespace | undefined) => void): void
  accept(dep: string, cb: (mod: ModuleNamespace | undefined) => void): void
  accept(
    deps: readonly string[],
    cb: (mods: Array<ModuleNamespace | undefined>) => void,
  ): void

  dispose(cb: (data: any) => void): void
  prune(cb: (data: any) => void): void
  invalidate(message?: string): void

  on<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  off<T extends string>(
    event: T,
    cb: (payload: InferCustomEventPayload<T>) => void,
  ): void
  send<T extends string>(event: T, data?: InferCustomEventPayload<T>): void
}
```

## Необхідна умовна перевірка

Перш за все, переконайтеся, що всі використання HMR API захищені умовним блоком, щоб код міг бути видалений під час оптимізації для продакшн:

```js
if (import.meta.hot) {
  // HMR код
}
```

## IntelliSense для TypeScript

Vite надає визначення типів для `import.meta.hot` у [`vite/client.d.ts`](https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts). Ви можете створити файл `env.d.ts` у директорії `src`, щоб TypeScript розпізнавав ці визначення типів:

```ts
/// <reference types="vite/client" />
```

## `hot.accept(cb)`

Щоб модуль сам приймав оновлення, використовуйте `import.meta.hot.accept` з колбеком, який отримує оновлений модуль:

```js twoslash
import 'vite/client'
// ---cut---
export const count = 1

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    if (newModule) {
      // newModule є undefined, коли сталася SyntaxError
      console.log('оновлено: count тепер ', newModule.count)
    }
  })
}
```

Модуль, який "приймає" гарячі оновлення, вважається **HMR межею**.

HMR Vite фактично не замінює оригінально імпортований модуль: якщо модуль HMR межі повторно експортує імпорти з залежності, то він відповідає за оновлення цих повторних експортів (і ці експорти повинні використовувати `let`). Крім того, імпортери в ланцюжку від модуля межі не будуть повідомлені про зміну. Це спрощене впровадження HMR достатньо для більшості випадків використання під час розробки, дозволяючи нам уникнути витрат на створення проксі-модулів.

Vite вимагає, щоб виклик цієї функції з'являвся як `import.meta.hot.accept(` (чутливий до пробілів) у вихідному коді, щоб модуль приймав оновлення. Це вимога статичного аналізу, який Vite виконує для підтримки HMR для модуля.

## `hot.accept(deps, cb)`

Модуль також може приймати оновлення від прямих залежностей без перезавантаження самого себе:

```js twoslash
// @filename: /foo.d.ts
export declare const foo: () => void

// @filename: /example.js
import 'vite/client'
// ---cut---
import { foo } from './foo.js'

foo()

if (import.meta.hot) {
  import.meta.hot.accept('./foo.js', (newFoo) => {
    // колбек отримує оновлений модуль './foo.js'
    newFoo?.foo()
  })

  // Також можна приймати масив модулів-залежностей:
  import.meta.hot.accept(
    ['./foo.js', './bar.js'],
    ([newFooModule, newBarModule]) => {
      // Колбек отримує масив, де тільки оновлений модуль не є null.
      // Якщо оновлення не було успішним (наприклад, синтаксична помилка),
      // масив буде порожнім
    },
  )
}
```

## `hot.dispose(cb)`

Модуль, який сам приймає оновлення, або модуль, який очікує, що його приймуть інші, може використовувати `hot.dispose` для очищення
