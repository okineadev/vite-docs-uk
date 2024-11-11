# Плагіновий хук HMR `hotUpdate`

::: tip Відгуки
Залиште нам відгук на [обговоренні Environment API](https://github.com/vitejs/vite/discussions/16358)
:::

Ми плануємо знецінити плагіновий хук `handleHotUpdate` на користь [хука `hotUpdate`](/guide/api-environment#the-hotupdate-hook), щоб бути сумісними з [Environment API](/guide/api-environment.md) і обробляти додаткові події спостереження за допомогою `create` та `delete`.

Зачеплена область: `Автори плагінів Vite`

::: warning Майбутнє знецінення
`hotUpdate` був вперше представлений у версії `v6.0`. Знецінення `handleHotUpdate` планується на версію `v7.0`. Ми поки не рекомендуємо відмовлятися від `handleHotUpdate`. Якщо ви хочете експериментувати та залишити нам відгук, ви можете використовувати `future.removePluginHookHandleHotUpdate` з `"warn"` у вашій конфігурації vite.
:::

## Мотивація

[Хук `handleHotUpdate`](/guide/api-plugin.md#handlehotupdate) дозволяє виконувати користувацьку обробку оновлень HMR. Список модулів для оновлення передається в `HmrContext`

```ts
interface HmrContext {
  file: string
  timestamp: number
  modules: Array<ModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

Цей хук викликається один раз для всіх середовищ, і передані модулі містять змішану інформацію лише з клієнтського та SSR середовищ. Коли фреймворки переходять на користувацькі середовища, потрібен новий хук, який викликається для кожного з них.

Новий хук `hotUpdate` працює так само, як і `handleHotUpdate`, але він викликається для кожного середовища і отримує новий екземпляр `HotUpdateContext`:

```ts
interface HotUpdateContext {
  type: 'create' | 'update' | 'delete'
  file: string
  timestamp: number
  modules: Array<EnvironmentModuleNode>
  read: () => string | Promise<string>
  server: ViteDevServer
}
```

Поточне середовище розробки можна отримати, як і в інших хуках плагінів, за допомогою `this.environment`. Список `modules` тепер міститиме модульні вузли лише з поточного середовища. Кожне оновлення середовища може визначати різні стратегії оновлення.

Цей хук також тепер викликається для додаткових подій спостереження, а не тільки для `'update'`. Використовуйте `type`, щоб розрізняти їх.

## Посібник з міграції

Фільтруйте та звужуйте список модулів, щоб HMR був більш точним.

```js
handleHotUpdate({ modules }) {
  return modules.filter(condition)
}

// Міграція до:

hotUpdate({ modules }) {
  return modules.filter(condition)
}
```

Поверніть порожній масив і виконайте повне перезавантаження:

```js
handleHotUpdate({ server, modules, timestamp }) {
  // Ручне інвалідовання модулів
  const invalidatedModules = new Set()
  for (const mod of modules) {
    server.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  server.ws.send({ type: 'full-reload' })
  return []
}

// Міграція до:

hotUpdate({ modules, timestamp }) {
  // Ручне інвалідовання модулів
  const invalidatedModules = new Set()
  for (const mod of modules) {
    this.environment.moduleGraph.invalidateModule(
      mod,
      invalidatedModules,
      timestamp,
      true
    )
  }
  this.environment.hot.send({ type: 'full-reload' })
  return []
}
```

Поверніть порожній масив і виконайте повну користувацьку обробку HMR, відправивши користувацькі події клієнту:

```js
handleHotUpdate({ server }) {
  server.ws.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}

// Міграція до...

hotUpdate() {
  this.environment.hot.send({
    type: 'custom',
    event: 'special-update',
    data: {}
  })
  return []
}
```

