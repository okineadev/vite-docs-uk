# Опції Воркера

Якщо не зазначено інше, опції в цьому розділі застосовуються до всіх dev, build та preview.

## worker.format

- **Тип:** `'es' | 'iife'`
- **За замовчуванням:** `'iife'`

Формат вихідного файлу для worker bundle.

## worker.plugins

- **Тип:** [`() => (Plugin | Plugin[])[]`](./shared-options#plugins)

Плагіни Vite, які застосовуються до worker bundles. Зверніть увагу, що [config.plugins](./shared-options#plugins) застосовується лише до workers у dev, його слід налаштувати тут для build.
Функція повинна повертати нові екземпляри плагінів, оскільки вони використовуються в паралельних збірках rollup worker. Таким чином, зміни в `config.worker` опціях у hook `config` будуть проігноровані.

## worker.rollupOptions

- **Тип:** [`RollupOptions`](https://rollupjs.org/configuration-options/)

Опції Rollup для збірки worker bundle.
