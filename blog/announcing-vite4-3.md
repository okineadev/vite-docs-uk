---
title: Vite 4.3 вийшов!
author:
  name: Команда Vite
date: 2023-04-20
sidebar: false
head:
  - - meta
    - property: og:type
      content: website
  - - meta
    - property: og:title
      content: Оголошення Vite 4.3
  - - meta
    - property: og:image
      content: https://vite.dev/og-image-announcing-vite4-3.png
  - - meta
    - property: og:url
      content: https://vite.dev/blog/announcing-vite4-3
  - - meta
    - property: og:description
      content: Оголошення про випуск Vite 4.3
  - - meta
    - name: twitter:card
      content: summary_large_image
---

# Vite 4.3 вийшов!

_20 квітня 2023 року_

![Зображення оголошення Vite 4.3](/og-image-announcing-vite4-3.png)

Швидкі посилання:

- Документація: [Англійська](/), [简体中文](https://cn.vite.dev/), [日本語](https://ja.vite.dev/), [Español](https://es.vite.dev/), [Português](https://pt.vite.dev/)
- [Журнал змін Vite 4.3](https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md#430-2023-04-20)

## Покращення продуктивності

У цьому мінорному випуску ми зосередилися на покращенні продуктивності dev-сервера. Логіка вирішення була оптимізована, покращені гарячі шляхи та впроваджено розумніше кешування для пошуку `package.json`, файлів конфігурації TS та загалом вирішених URL.

Ви можете прочитати детальний огляд виконаної роботи з покращення продуктивності в цьому блозі одного з учасників Vite: [Як ми зробили Vite 4.3 швидшим 🚀](https://sun0day.github.io/blog/vite/why-vite4_3-is-faster.html).

Цей спринт призвів до покращення швидкості у всіх аспектах порівняно з Vite 4.2.

Ось покращення продуктивності, виміряні за допомогою [sapphi-red/performance-compare](https://github.com/sapphi-red/performance-compare), який тестує додаток з 1000 React компонентами холодного та теплого запуску dev-сервера, а також часи HMR для кореневого та листового компонентів:

| **Vite (babel)**   |  Vite 4.2 | Vite 4.3 | Покращення |
| :----------------- | --------: | -------: | ---------: |
| **холодний старт dev** | 17249.0мс | 5132.4мс |      -70.2% |
| **теплий старт dev** |  6027.8мс | 4536.1мс |      -24.7% |
| **Кореневий HMR**       |    46.8мс |   26.7мс |      -42.9% |
| **Листовий HMR**       |    27.0мс |   12.9мс |      -52.2% |

| **Vite (swc)**     |  Vite 4.2 | Vite 4.3 | Покращення |
| :----------------- | --------: | -------: | ---------: |
| **холодний старт dev** | 13552.5мс | 3201.0мс |      -76.4% |
| **теплий старт dev** |  4625.5мс | 2834.4мс |      -38.7% |
| **Кореневий HMR**       |    30.5мс |   24.0мс |      -21.3% |
| **Листовий HMR**       |    16.9мс |   10.0мс |      -40.8% |

![Порівняння часу запуску Vite 4.3 та 4.2](/vite4-3-startup-time.png)

![Порівняння часу HMR Vite 4.3 та 4.2](/vite4-3-hmr-time.png)

Більше інформації про бенчмарк можна прочитати [тут](https://gist.github.com/sapphi-red/25be97327ee64a3c1dce793444afdf6e). Специфікації та версії для цього тесту продуктивності:

- CPU: Ryzen 9 5900X, Пам'ять: DDR4-3600 32GB, SSD: WD Blue SN550 NVME SSD
- Windows 10 Pro 21H2 19044.2846
- Node.js 18.16.0
- Версії Vite та плагінів React
  - Vite 4.2 (babel): Vite 4.2.1 + plugin-react 3.1.0
  - Vite 4.3 (babel): Vite 4.3.0 + plugin-react 4.0.0-beta.1
  - Vite 4.2 (swc): Vite 4.2.1 + plugin-react-swc 3.2.0
  - Vite 4.3 (swc): Vite 4.3.0 + plugin-react-swc 3.3.0

Ранні користувачі також повідомили про покращення часу запуску dev-сервера в 1.5-2 рази на реальних додатках під час тестування бета-версії Vite 4.3. Ми б хотіли дізнатися результати для ваших додатків.

## Профілювання

Ми продовжимо працювати над продуктивністю Vite. Ми працюємо над офіційним [інструментом бенчмаркінгу](https://github.com/vitejs/vite-benchmark) для Vite, який дозволить нам отримувати метрики продуктивності для кожного Pull Request.

І [vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect) тепер має більше функцій, пов'язаних з продуктивністю, щоб допомогти вам визначити, які плагіни або проміжні програмні засоби є вузьким місцем для ваших додатків.

Використання `vite --profile` (а потім натискання `p`) після завантаження сторінки збереже профіль CPU запуску dev-сервера. Ви можете відкрити їх у додатку, як [speedscope](https://www.speedscope.app/), щоб визначити проблеми з продуктивністю. І ви можете поділитися своїми знахідками з командою Vite у [Discussion](https://github.com/vitejs/vite/discussions) або на [Discord Vite](https://chat.vite.dev).

## Наступні кроки

Ми вирішили зробити один великий випуск Vite цього року, узгоджуючи його з [EOL Node.js 16](https://endoflife.date/nodejs) у вересні, припиняючи підтримку як Node.js 14, так і 16 у ньому. Якщо ви хочете долучитися, ми розпочали [обговорення Vite 5](https://github.com/vitejs/vite/discussions/12466) для збору ранніх відгуків.
