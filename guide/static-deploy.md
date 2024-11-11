# Розгортання статичного сайту

Наступні інструкції базуються на деяких спільних припущеннях:

- Ви використовуєте стандартне місце виводу збірки (`dist`). Це місце [можна змінити за допомогою `build.outDir`](/config/build-options.md#build-outdir), і ви можете екстраполювати інструкції з цих керівництв у такому випадку.
- Ви використовуєте npm. Ви можете використовувати еквівалентні команди для запуску скриптів, якщо ви використовуєте Yarn або інші менеджери пакетів.
- Vite встановлено як локальну залежність розробки у вашому проєкті, і ви налаштували наступні npm скрипти:

```json [package.json]
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

Важливо зазначити, що `vite preview` призначений для попереднього перегляду збірки локально і не призначений для використання як продуктивний сервер.

:::tip ПРИМІТКА
Ці інструкції надають вказівки щодо виконання статичного розгортання вашого сайту на Vite. Vite також підтримує рендеринг на стороні сервера (SSR). SSR стосується фронтенд-фреймворків, які підтримують запуск тієї ж програми в Node.js, попередньо рендерять її в HTML і, нарешті, гідрують її на клієнті. Ознайомтеся з [керівництвом SSR](./ssr), щоб дізнатися про цю функцію. З іншого боку, якщо ви шукаєте інтеграцію з традиційними серверними фреймворками, ознайомтеся з [керівництвом з інтеграції бекенду](./backend-integration).
:::

## Збірка додатку

Ви можете виконати команду `npm run build`, щоб зібрати додаток.

```bash
$ npm run build
```

За замовчуванням, вихідна збірка буде розміщена в папці `dist`. Ви можете розгорнути цю папку `dist` на будь-якій з ваших улюблених платформ.

### Тестування додатку локально

Після того, як ви зібрали додаток, ви можете протестувати його локально, виконавши команду `npm run preview`.

```bash
$ npm run preview
```

Команда `vite preview` запустить локальний статичний веб-сервер, який обслуговує файли з `dist` за адресою `http://localhost:4173`. Це простий спосіб перевірити, чи виглядає продуктивна збірка добре у вашому локальному середовищі.

Ви можете налаштувати порт сервера, передавши аргумент `--port`.

```json [package.json]
{
  "scripts": {
    "preview": "vite preview --port 8080"
  }
}
```

Тепер команда `preview` запустить сервер за адресою `http://localhost:8080`.

## GitHub Pages

1. Встановіть правильне значення `base` у файлі `vite.config.js`.

  Якщо ви розгортаєте сайт на `https://<ІМ'Я_КОРИСТУВАЧА>.github.io/` або на власному домені через GitHub Pages (наприклад, `www.example.com`), встановіть `base` як `'/'`. Альтернативно, ви можете видалити `base` з конфігурації, оскільки за замовчуванням воно встановлено як `'/'`.

  Якщо ви розгортаєте сайт на `https://<ІМ'Я_КОРИСТУВАЧА>.github.io/<РЕПОЗИТОРІЙ>/` (наприклад, ваш репозиторій знаходиться за адресою `https://github.com/<ІМ'Я_КОРИСТУВАЧА>/<РЕПОЗИТОРІЙ>`), тоді встановіть `base` як `'/<РЕПОЗИТОРІЙ>/'`.

2. Перейдіть до налаштувань GitHub Pages у вашому репозиторії та виберіть джерело розгортання як "GitHub Actions". Це призведе до створення робочого процесу, який збирає та розгортає ваш проєкт. Приклад робочого процесу, який встановлює залежності та збирає проєкт за допомогою npm, наведено нижче:

  ```yml
  # Простий робочий процес для розгортання статичного контенту на GitHub Pages
  name: Deploy static content to Pages

  on:
    # Запускається при пушах у основну гілку
    push:
     branches: ['main']

    # Дозволяє запускати цей робочий процес вручну з вкладки Actions
    workflow_dispatch:

  # Встановлює дозволи GITHUB_TOKEN для розгортання на GitHub Pages
  permissions:
    contents: read
    pages: write
    id-token: write

  # Дозволяє одне одночасне розгортання
  concurrency:
    group: 'pages'
    cancel-in-progress: true

  jobs:
    # Один робочий процес для розгортання
    deploy:
     environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
     runs-on: ubuntu-latest
     steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
         node-version: 20
         cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Setup Pages
        uses: actions/configure-pages@v4
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
         # Завантажити папку dist
         path: './dist'
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
  ```

## GitLab Pages та GitLab CI

1. Встановіть правильне значення `base` у файлі `vite.config.js`.

  Якщо ви розгортаєте сайт на `https://<ІМ'Я_КОРИСТУВАЧА або ГРУПИ>.gitlab.io/`, ви можете пропустити `base`, оскільки за замовчуванням воно встановлено як `'/'`.

  Якщо ви розгортаєте сайт на `https://<ІМ'Я_КОРИСТУВАЧА або ГРУПИ>.gitlab.io/<РЕПОЗИТОРІЙ>/`, наприклад, ваш репозиторій знаходиться за адресою `https://gitlab.com/<ІМ'Я_КОРИСТУВАЧА>/<РЕПОЗИТОРІЙ>`, тоді встановіть `base` як `'/<РЕПОЗИТОРІЙ>/'`.

2. Створіть файл `.gitlab-ci.yml` у корені вашого проєкту з наступним вмістом. Це дозволить збирати та розгортати ваш сайт щоразу, коли ви вносите зміни до вашого контенту:

  ```yaml [.gitlab-ci.yml]
  image: node:16.5.0
  pages:
    stage: deploy
    cache:
     key:
      files:
        - package-lock.json
      prefix: npm
     paths:
      - node_modules/
    script:
     - npm install
     - npm run build
     - cp -a dist/. public/
    artifacts:
     paths:
      - public
    rules:
     - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  ```

## Netlify

### Netlify CLI

1. Встановіть [Netlify CLI](https://cli.netlify.com/).
2. Створіть новий сайт за допомогою `ntl init`.
3. Розгорніть за допомогою `ntl deploy`.

```bash
# Встановіть Netlify CLI
$ npm install -g netlify-cli

# Створіть новий сайт у Netlify
$ ntl init

# Розгорніть на унікальну попередню URL-адресу
$ ntl deploy
```

Netlify CLI надасть вам попередню URL-адресу для перевірки. Коли ви будете готові до продуктивного розгортання, використовуйте прапорець `prod`:

```bash
# Розгорніть сайт у продуктивне середовище
$ ntl deploy --prod
```

### Netlify з Git

1. Відправте ваш код у git-репозиторій (GitHub, GitLab, BitBucket, Azure DevOps).
2. [Імпортуйте проєкт](https://app.netlify.com/start) у Netlify.
3. Виберіть гілку, вихідний каталог і налаштуйте змінні середовища, якщо це необхідно.
4. Натисніть **Deploy**.
5. Ваш Vite додаток розгорнуто!

Після імпорту та розгортання вашого проєкту, всі наступні пуші в гілки, відмінні від продуктивної, разом із pull-запитами будуть генерувати [Попередні Розгортання](https://docs.netlify.com/site-deploys/deploy-previews/), а всі зміни, внесені в продуктивну гілку (зазвичай "main"), призведуть до [Продуктивного Розгортання](https://docs.netlify.com/site-deploys/overview/#definitions).

## Vercel

### Vercel CLI

1. Встановіть [Vercel CLI](https://vercel.com/cli) та запустіть `vercel` для розгортання.
2. Vercel визначить, що ви використовуєте Vite, і налаштує правильні параметри для вашого розгортання.
3. Ваш додаток розгорнуто! (наприклад, [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/))

```bash
$ npm i -g vercel
$ vercel init vite
Vercel CLI
> Success! Initialized "vite" example in ~/your-folder.
- To deploy, `cd vite` and run `vercel`.
```

### Vercel для Git

1. Відправте ваш код у git-репозиторій (GitHub, GitLab, Bitbucket).
2. [Імпортуйте ваш Vite проєкт](https://vercel.com/new) у Vercel.
3. Vercel визначить, що ви використовуєте Vite, і налаштує правильні параметри для вашого розгортання.
4. Ваш додаток розгорнуто! (наприклад, [vite-vue-template.vercel.app](https://vite-vue-template.vercel.app/))

Після імпорту та розгортання вашого проєкту, всі наступні пуші в гілки будуть генерувати [Попередні Розгортання](https://vercel.com/docs/concepts/deployments/environments#preview), а всі зміни, внесені в продуктивну гілку (зазвичай "main"), призведуть до [Продуктивного Розгортання](https://vercel.com/docs/concepts/deployments/environments#production).

Дізнайтеся більше про [Git інтеграцію Vercel](https://vercel.com/docs/concepts/git).

## Cloudflare Pages

### Cloudflare Pages через Wrangler

1. Встановіть [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/get-started/).
2. Аутентифікуйте Wrangler з вашим обліковим записом Cloudflare за допомогою `wrangler login`.
3. Запустіть вашу команду збірки.
4. Розгорніть за допомогою `npx wrangler pages deploy dist`.

```bash
# Встановіть Wrangler CLI
$ npm install -g wrangler

# Увійдіть до облікового запису Cloudflare з CLI
$ wrangler login

# Запустіть вашу команду збірки
$ npm run build

# Створіть нове розгортання
$ npx wrangler pages deploy dist
```

Після завантаження ваших активів, Wrangler надасть вам попередню URL-адресу для перевірки вашого сайту. Коли ви увійдете до панелі керування Cloudflare Pages, ви побачите ваш новий проєкт.

### Cloudflare Pages з Git

1. Відправте ваш код у git-репозиторій (GitHub, GitLab).
2. Увійдіть до панелі керування Cloudflare та виберіть ваш обліковий запис у **Account Home** > **Pages**.
3. Виберіть **Create a new Project** та опцію **Connect Git**.
4. Виберіть git-проєкт, який ви хочете розгорнути, та натисніть **Begin setup**.
5. Виберіть відповідний пресет фреймворку в налаштуваннях збірки залежно від обраного вами фреймворку Vite.
6. Збережіть та розгорніть!
7. Ваш додаток розгорнуто! (наприклад, `https://<PROJECTNAME>.pages.dev/`)

Після імпорту та розгортання вашого проєкту, всі наступні пуші в гілки будуть генерувати [Попередні Розгортання](https://developers.cloudflare.com/pages/platform/preview-deployments/), якщо не вказано інше у ваших [налаштуваннях збірки гілок](https://developers.cloudflare.com/pages/platform/branch-build-controls/). Всі зміни в продуктивній гілці (зазвичай "main") призведуть до Продуктивного Розгортання.

Ви також можете додати власні домени та налаштувати власні параметри збірки на Pages. Дізнайтеся більше про [Git інтеграцію Cloudflare Pages](https://developers.cloudflare.com/pages/get-started/#manage-your-site).

## Google Firebase

1. Переконайтеся, що у вас встановлено [firebase-tools](https://www.npmjs.com/package/firebase-tools).

2. Створіть `firebase.json` та `.firebaserc` у корені вашого проєкту з наступним вмістом:

  ```json [firebase.json]
  {
    "hosting": {
     "public": "dist",
     "ignore": [],
     "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
     ]
    }
  }
  ```

  ```js [.firebaserc]
  {
    "projects": {
     "default": "<YOUR_FIREBASE_ID>"
    }
  }
  ```

3. Після запуску `npm run build`, розгорніть за допомогою команди `firebase deploy`.

## Surge

1. Спочатку встановіть [surge](https://www.npmjs.com/package/surge), якщо ви ще цього не зробили.

2. Виконайте команду `npm run build`.

3. Розгорніть на surge, ввівши `surge dist`.

Ви також можете розгорнути на [власному домені](http://surge.sh/help/adding-a-custom-domain), додавши `surge dist yourdomain.com`.

## Azure Static Web Apps

Ви можете швидко розгорнути свій Vite додаток за допомогою сервісу Microsoft Azure [Static Web Apps](https://aka.ms/staticwebapps). Вам потрібно:

- Обліковий запис Azure та ключ підписки. Ви можете створити [безкоштовний обліковий запис Azure тут](https://azure.microsoft.com/free).
- Ваш код додатку, завантажений на [GitHub](https://github.com).
- [Розширення SWA](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurestaticwebapps) у [Visual Studio Code](https://code.visualstudio.com).

Встановіть розширення у VS Code та перейдіть до кореня вашого додатку. Відкрийте розширення Static Web Apps, увійдіть до Azure та натисніть знак '+' для створення нової Static Web App. Вам буде запропоновано вказати, який ключ підписки використовувати.

Слідуйте майстру, який запуститься після цього, щоб дати вашому додатку ім'я, вибрати пресет фреймворку та вказати корінь додатку (зазвичай `/`) і місце розташування зібраних файлів `/dist`. Майстер створить GitHub action у вашому репозиторії у папці `.github`.

Цей action буде працювати для розгортання вашого додатку (спостерігайте за його прогресом у вкладці Actions вашого репозиторію) і, коли він успішно завершиться, ви зможете переглянути ваш додаток за адресою, наданою у вікні прогресу розширення, натиснувши кнопку 'Browse Website', яка з'явиться після виконання GitHub action.

## Render

Ви можете розгорнути свій Vite додаток як статичний сайт на [Render](https://render.com/).

1. Створіть [обліковий запис Render](https://dashboard.render.com/register).

2. У [Панелі керування](https://dashboard.render.com/), натисніть кнопку **New** та виберіть **Static Site**.

3. Підключіть ваш обліковий запис GitHub/GitLab або використовуйте публічний репозиторій.

4. Вкажіть ім'я проєкту та гілку.

  - **Команда збірки**: `npm install && npm run build`
  - **Каталог публікації**: `dist`

5. Натисніть **Create Static Site**.

  Ваш додаток буде розгорнуто за адресою `https://<PROJECTNAME>.onrender.com/`.

За замовчуванням, будь-який новий коміт, відправлений у вказану гілку, автоматично викликатиме нове розгортання. [Авто-розгортання](https://render.com/docs/deploys#toggling-auto-deploy-for-a-service) можна налаштувати у налаштуваннях проєкту.

Ви також можете додати [власний домен](https://render.com/docs/custom-domains) до вашого проєкту.

<!--
  NOTE: The sections below are reserved for more deployment platforms not listed above.
  Feel free to submit a PR that adds a new section with a link to your platform's
  deployment guide, as long as it meets these criteria:

  1. Users should be able to deploy their site for free.
  2. Free tier offerings should host the site indefinitely and are not time-bound.
    Offering a limited number of computation resource or site counts in exchange is fine.
  3. The linked guides should not contain any malicious content.

  The Vite team may change the criteria and audit the current list from time to time.
  If a section is removed, we will ping the original PR authors before doing so.
-->

## Flightcontrol

Розгорніть свій статичний сайт за допомогою [Flightcontrol](https://www.flightcontrol.dev/?ref=docs-vite), слідуючи цим [інструкціям](https://www.flightcontrol.dev/docs/reference/examples/vite?ref=docs-vite).

## Kinsta Static Site Hosting

Розгорніть свій статичний сайт за допомогою [Kinsta](https://kinsta.com/static-site-hosting/), слідуючи цим [інструкціям](https://kinsta.com/docs/react-vite-example/).

## xmit Static Site Hosting

Розгорніть свій статичний сайт за допомогою [xmit](https://xmit.co), слідуючи цьому [керівництву](https://xmit.dev/posts/vite-quickstart/).
