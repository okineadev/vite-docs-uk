# Плагіни

:::tip ПРИМІТКА
Vite прагне забезпечити підтримку загальних шаблонів веб-розробки "з коробки". Перед тим, як шукати плагін Vite або сумісний плагін Rollup, ознайомтеся з [Посібником з функцій](../guide/features.md). Багато випадків, коли в проекті Rollup потрібен плагін, вже покриті у Vite.
:::

Ознайомтеся з [Використання плагінів](../guide/using-plugins) для отримання інформації про те, як використовувати плагіни.

## Офіційні плагіни

### [@vitejs/plugin-vue](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue)

- Забезпечує підтримку однофайлових компонентів Vue 3.

### [@vitejs/plugin-vue-jsx](https://github.com/vitejs/vite-plugin-vue/tree/main/packages/plugin-vue-jsx)

- Забезпечує підтримку JSX для Vue 3 (через [спеціальний Babel трансформатор](https://github.com/vuejs/jsx-next)).

### [@vitejs/plugin-vue2](https://github.com/vitejs/vite-plugin-vue2)

- Забезпечує підтримку однофайлових компонентів Vue 2.7.

### [@vitejs/plugin-vue2-jsx](https://github.com/vitejs/vite-plugin-vue2-jsx)

- Забезпечує підтримку JSX для Vue 2.7 (через [спеціальний Babel трансформатор](https://github.com/vuejs/jsx-vue2/)).

### [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)

- Використовує esbuild та Babel, досягаючи швидкого HMR з невеликим розміром пакету та гнучкістю можливості використовувати конвеєр трансформації Babel. Без додаткових плагінів Babel під час збірки використовується лише esbuild.

### [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc)

- Замінює Babel на SWC під час розробки. Під час збірок використовуються SWC+esbuild при використанні плагінів, і лише esbuild в іншому випадку. Для великих проектів, які не потребують нестандартних розширень React, холодний старт і гаряча заміна модулів (HMR) можуть бути значно швидшими.

### [@vitejs/plugin-legacy](https://github.com/vitejs/vite/tree/main/packages/plugin-legacy)

- Забезпечує підтримку застарілих браузерів для виробничої збірки.

## Плагіни спільноти

Ознайомтеся з [awesome-vite](https://github.com/vitejs/awesome-vite#plugins) - ви також можете подати PR, щоб додати свої плагіни туди.

## Плагіни Rollup

[Плагіни Vite](../guide/api-plugin) є розширенням інтерфейсу плагінів Rollup. Ознайомтеся з розділом [Сумісність плагінів Rollup](../guide/api-plugin#rollup-plugin-compatibility) для отримання додаткової інформації.
