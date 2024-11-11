# Параметри Попереднього Перегляду

Якщо не зазначено інше, параметри в цьому розділі застосовуються лише до попереднього перегляду.

## preview.host

- **Тип:** `string | boolean`
- **За замовчуванням:** [`server.host`](./server-options#server-host)

Вкажіть, на яких IP-адресах сервер повинен слухати. Встановіть це значення на `0.0.0.0` або `true`, щоб слухати на всіх адресах, включаючи локальні та публічні адреси.

Це можна встановити через CLI, використовуючи `--host 0.0.0.0` або `--host`.

::: tip ПРИМІТКА

Існують випадки, коли інші сервери можуть відповідати замість Vite. Дивіться [`server.host`](./server-options#server-host) для отримання додаткової інформації.

:::

## preview.port

- **Тип:** `number`
- **За замовчуванням:** `4173`

Вкажіть порт сервера. Зверніть увагу, якщо порт вже використовується, Vite автоматично спробує наступний доступний порт, тому це може бути не фактичний порт, на якому сервер в кінцевому підсумку слухатиме.

**Приклад:**

```js
export default defineConfig({
  server: {
    port: 3030,
  },
  preview: {
    port: 8080,
  },
})
```

## preview.strictPort

- **Тип:** `boolean`
- **За замовчуванням:** [`server.strictPort`](./server-options#server-strictport)

Встановіть значення `true`, щоб вийти, якщо порт вже використовується, замість автоматичної спроби наступного доступного порту.

## preview.https

- **Тип:** `https.ServerOptions`
- **За замовчуванням:** [`server.https`](./server-options#server-https)

Увімкніть TLS + HTTP/2. Зверніть увагу, що це знижується до TLS лише при використанні параметра [`server.proxy`](./server-options#server-proxy).

Значення також може бути [об'єктом параметрів](https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener), переданим до `https.createServer()`.

## preview.open

- **Тип:** `boolean | string`
- **За замовчуванням:** [`server.open`](./server-options#server-open)

Автоматично відкривайте додаток у браузері при запуску сервера. Коли значення є рядком, воно буде використано як шлях URL. Якщо ви хочете відкрити сервер у певному браузері, який вам подобається, ви можете встановити змінну середовища `process.env.BROWSER` (наприклад, `firefox`). Ви також можете встановити `process.env.BROWSER_ARGS`, щоб передати додаткові аргументи (наприклад, `--incognito`).

`BROWSER` та `BROWSER_ARGS` також є спеціальними змінними середовища, які ви можете встановити у файлі `.env`, щоб налаштувати це. Дивіться [пакет `open`](https://github.com/sindresorhus/open#app) для отримання додаткової інформації.

## preview.proxy

- **Тип:** `Record<string, string | ProxyOptions>`
- **За замовчуванням:** [`server.proxy`](./server-options#server-proxy)

Налаштуйте власні правила проксі для сервера попереднього перегляду. Очікується об'єкт пар `{ ключ: параметри }`. Якщо ключ починається з `^`, він буде інтерпретований як `RegExp`. Параметр `configure` можна використовувати для доступу до екземпляра проксі.

Використовує [`http-proxy`](https://github.com/http-party/node-http-proxy). Повні параметри [тут](https://github.com/http-party/node-http-proxy#options).

## preview.cors

- **Тип:** `boolean | CorsOptions`
- **За замовчуванням:** [`server.cors`](./server-options#server-cors)

Налаштуйте CORS для сервера попереднього перегляду. Це увімкнено за замовчуванням і дозволяє будь-яке походження. Передайте [об'єкт параметрів](https://github.com/expressjs/cors#configuration-options), щоб точно налаштувати поведінку, або `false`, щоб вимкнути.

## preview.headers

- **Тип:** `OutgoingHttpHeaders`

Вкажіть заголовки відповіді сервера.
