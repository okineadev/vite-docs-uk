# `this.environment` у хуках

::: tip Відгук
Залиште свій відгук у [обговоренні зворотного зв'язку щодо API середовища](https://github.com/vitejs/vite/discussions/16358)
:::

До Vite 6 було доступно лише два середовища: `client` та `ssr`. Єдиний аргумент хуків плагінів `options.ssr` у `resolveId`, `load` та `transform` дозволяв авторам плагінів розрізняти ці два середовища при обробці модулів у хуках плагінів. У Vite 6 додаток Vite може визначати будь-яку кількість названих середовищ за потребою. Ми вводимо `this.environment` у контекст плагіна для взаємодії з середовищем поточного модуля у хуках.

Область застосування: `Автори плагінів Vite`

::: warning Майбутнє знецінення
`this.environment` було введено у версії `v6.0`. Знецінення `options.ssr` планується у версії `v7.0`. У цей момент ми почнемо рекомендувати міграцію ваших плагінів на новий API. Щоб визначити ваше використання, встановіть `future.removePluginHookSsrArgument` на `"warn"` у вашій конфігурації vite.
:::

## Мотивація

`this.environment` не тільки дозволяє реалізації хуків плагінів знати назву поточного середовища, але й надає доступ до параметрів конфігурації середовища, інформації про граф модулів та конвеєр перетворення (`environment.config`, `environment.moduleGraph`, `environment.transformRequest()`). Наявність екземпляра середовища у контексті дозволяє авторам плагінів уникнути залежності від усього dev-сервера (зазвичай кешується при запуску через хук `configureServer`).

## Посібник з міграції

Для швидкої міграції існуючого плагіна замініть аргумент `options.ssr` на `this.environment.name !== 'client'` у хуках `resolveId`, `load` та `transform`:

```ts
import { Plugin } from 'vite'

export function myPlugin(): Plugin {
  return {
    name: 'my-plugin',
    resolveId(id, importer, options) {
      const isSSR = options.ssr // [!code --]
      const isSSR = this.environment.name !== 'client' // [!code ++]

      if (isSSR) {
        // Логіка для SSR
      } else {
        // Логіка для клієнта
      }
    },
  }
}
```

Для більш надійної довгострокової реалізації хук плагіна повинен обробляти [декілька середовищ](/guide/api-environment.html#accessing-the-current-environment-in-hooks) з використанням детальних параметрів середовища замість покладання на назву середовища.
