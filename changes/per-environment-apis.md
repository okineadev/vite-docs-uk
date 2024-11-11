# Перехід до API для кожного середовища

::: tip Відгуки
Залиште нам відгук на [обговоренні відгуків щодо Environment API](https://github.com/vitejs/vite/discussions/16358)
:::

Кілька API з `ViteDevServer`, пов'язаних з графом модулів та перетворенням модулів, були перенесені до екземплярів `DevEnvironment`.

Область впливу: `Автори плагінів Vite`

::: warning Майбутнє знецінення
Екземпляр `Environment` був вперше представлений у версії `v6.0`. Знецінення `server.moduleGraph` та інших методів, які тепер знаходяться в середовищах, планується у версії `v7.0`. Ми не рекомендуємо поки що відмовлятися від методів сервера. Щоб визначити ваше використання, встановіть ці параметри у вашій конфігурації vite.

```ts
future: {
  removeServerModuleGraph: 'warn',
  removeServerTransformRequest: 'warn',
}
```

:::

## Мотивація

У Vite v5 та раніше, один сервер розробки Vite завжди мав два середовища (`client` та `ssr`). `server.moduleGraph` містив змішані модулі з обох цих середовищ. Вузли були з'єднані через списки `clientImportedModules` та `ssrImportedModules` (але підтримувався один список `importers` для кожного). Перетворений модуль представлявся за допомогою `id` та булевого значення `ssr`. Це булеве значення потрібно було передавати до API, наприклад `server.moduleGraph.getModuleByUrl(url, ssr)` та `server.transformRequest(url, { ssr })`.

У Vite v6 тепер можливо створювати будь-яку кількість користувацьких середовищ (`client`, `ssr`, `edge` тощо). Одного булевого значення `ssr` більше недостатньо. Замість зміни API до форми `server.transformRequest(url, { environment })`, ми перенесли ці методи до екземпляра середовища, що дозволяє викликати їх без сервера розробки Vite.

## Посібник з міграції

- `server.moduleGraph` -> [`environment.moduleGraph`](/guide/api-environment#separate-module-graphs)
- `server.transformRequest(url, ssr)` -> `environment.transformRequest(url)`
- `server.warmupRequest(url, ssr)` -> `environment.warmupRequest(url)`
