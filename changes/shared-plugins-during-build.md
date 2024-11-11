# Спільні плагіни під час збірки

::: tip Відгуки
Залиште нам відгук на [обговоренні відгуків про Environment API](https://github.com/vitejs/vite/discussions/16358)
:::

Дивіться [Спільні плагіни під час збірки](/guide/api-environment.md#shared-plugins-during-build).

Сфера впливу: `Автори плагінів Vite`

::: warning Майбутня зміна за замовчуванням
`builder.sharedConfigBuild` був вперше представлений у версії `v6.0`. Ви можете встановити його значення true, щоб перевірити, як ваші плагіни працюють зі спільною конфігурацією. Ми шукаємо відгуки про зміну значення за замовчуванням у майбутній основній версії, коли екосистема плагінів буде готова.
:::

## Мотивація

Узгодження плагінів для розробки та збірки.

## Посібник з міграції

Щоб мати можливість ділитися плагінами між середовищами, стан плагіна повинен бути прив'язаний до поточного середовища. Плагін наступного виду буде рахувати кількість трансформованих модулів у всіх середовищах.

```js
function CountTransformedModulesPlugin() {
  let transformedModules
  return {
    name: 'count-transformed-modules',
    buildStart() {
      transformedModules = 0
    },
    transform(id) {
      transformedModules++
    },
    buildEnd() {
      console.log(transformedModules)
    },
  }
}
```

Якщо ми хочемо рахувати кількість трансформованих модулів для кожного середовища окремо, нам потрібно зберігати карту:

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = new Map<Environment, { count: number }>()
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state.set(this.environment, { count: 0 })
    }
    transform(id) {
      state.get(this.environment).count++
    },
    buildEnd() {
      console.log(this.environment.name, state.get(this.environment).count)
    }
  }
}
```

Щоб спростити цей шаблон, у Vite ми використовуємо хелпер `usePerEnvironmentState`:

```js
function PerEnvironmentCountTransformedModulesPlugin() {
  const state = usePerEnvironmentState<{ count: number }>(() => ({ count: 0 }))
  return {
    name: 'count-transformed-modules',
    perEnvironmentStartEndDuringDev: true,
    buildStart() {
      state(this).count = 0
    }
    transform(id) {
      state(this).count++
    },
    buildEnd() {
      console.log(this.environment.name, state(this).count)
    }
  }
}
```
