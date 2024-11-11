import type { DefaultTheme } from 'vitepress'
import { defineConfig } from 'vitepress'
import { transformerTwoslash } from '@shikijs/vitepress-twoslash'
import {
  groupIconMdPlugin,
  groupIconVitePlugin,
} from 'vitepress-plugin-group-icons'
import { buildEnd } from './buildEnd.config'

const ogDescription = 'Інструменти фронтенд-розробки нового покоління'
const ogImage = 'https://vite.dev/og-image.jpg'
const ogTitle = 'Vite'
const ogUrl = 'https://vite.dev'

// netlify envs
const deployURL = process.env.DEPLOY_PRIME_URL || ''
const commitRef = process.env.COMMIT_REF?.slice(0, 8) || 'dev'

const deployType = (() => {
  switch (deployURL) {
    case 'https://main--vite-docs-main.netlify.app':
      return 'main'
    case '':
      return 'local'
    default:
      return 'release'
  }
})()
const additionalTitle = ((): string => {
  switch (deployType) {
    case 'main':
      return ' (main branch)'
    case 'local':
      return ' (local)'
    case 'release':
      return ''
  }
})()
const versionLinks = ((): DefaultTheme.NavItemWithLink[] => {
  const oldVersions: DefaultTheme.NavItemWithLink[] = [
    {
      text: 'Документація Vite 4',
      link: 'https://v4.vite.dev',
    },
    {
      text: 'Документація Vite 3',
      link: 'https://v3.vite.dev',
    },
    {
      text: 'Документація Vite 2',
      link: 'https://v2.vite.dev',
    },
  ]

  switch (deployType) {
    case 'main':
    case 'local':
      return [
        {
          text: 'Документація Vite 5 (реліз)',
          link: 'https://vite.dev',
        },
        ...oldVersions,
      ]
    case 'release':
      return oldVersions
  }
})()

export default defineConfig({
  title: `Vite${additionalTitle}`,
  description: 'Інструменти фронтенд-розробки нового покоління',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    [
      'link',
      { rel: 'alternate', type: 'application/rss+xml', href: '/blog.rss' },
    ],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    [
      'link',
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: 'true',
      },
    ],
    [
      'link',
      {
        rel: 'preload',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600&family=IBM+Plex+Mono:wght@400&display=swap',
        as: 'style',
      },
    ],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600&family=IBM+Plex+Mono:wght@400&display=swap',
      },
    ],
    ['link', { rel: 'me', href: 'https://m.webtoo.ls/@vite' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: ogTitle }],
    ['meta', { property: 'og:image', content: ogImage }],
    ['meta', { property: 'og:url', content: ogUrl }],
    ['meta', { property: 'og:description', content: ogDescription }],
    ['meta', { property: 'og:site_name', content: 'vitejs' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:site', content: '@vite_js' }],
    ['meta', { name: 'theme-color', content: '#646cff' }],
    [
      'script',
      {
        src: 'https://cdn.usefathom.com/script.js',
        'data-site': 'CBDFBSLI',
        'data-spa': 'auto',
        defer: '',
      },
    ],
  ],

  locales: {
    root: { label: 'Українська' },
    en: { label: 'English', link: 'https://vite.dev' },
    zh: { label: '简体中文', link: 'https://cn.vite.dev' },
    ja: { label: '日本語', link: 'https://ja.vite.dev' },
    es: { label: 'Español', link: 'https://es.vite.dev' },
    pt: { label: 'Português', link: 'https://pt.vite.dev' },
    ko: { label: '한국어', link: 'https://ko.vite.dev' },
    de: { label: 'Deutsch', link: 'https://de.vite.dev' },
  },

  themeConfig: {
    logo: '/logo.svg',

    editLink: {
      pattern: 'https://github.com/vitejs/vite/edit/main/docs/:path',
      text: 'Запропонувати зміни до цієї сторінки',
    },

    socialLinks: [
      { icon: 'bluesky', link: 'https://bsky.app/profile/vite.dev' },
      { icon: 'mastodon', link: 'https://elk.zone/m.webtoo.ls/@vite' },
      { icon: 'x', link: 'https://x.com/vite_js' },
      { icon: 'discord', link: 'https://chat.vite.dev' },
      { icon: 'github', link: 'https://github.com/vitejs/vite' },
    ],

    algolia: {
      appId: '7H67QR5P0A',
      apiKey: '208bb9c14574939326032b937431014b',
      indexName: 'vitejs',
      searchParameters: {
        facetFilters: ['tags:en'],
      },
    },

    carbonAds: {
      code: 'CEBIEK3N',
      placement: 'vitejsdev',
    },

    footer: {
      message: `Випущено під ліцензією MIT. (${commitRef})`,
      copyright: 'Авторське право © 2019-дотепер VoidZero Inc. & Внесок Vite',
    },

    nav: [
      { text: 'Посібник', link: '/guide/', activeMatch: '/guide/' },
      { text: 'Конфігурація', link: '/config/', activeMatch: '/config/' },
      { text: 'Плагіни', link: '/plugins/', activeMatch: '/plugins/' },
      {
        text: 'Ресурси',
        items: [
          { text: 'Команда', link: '/team' },
          { text: 'Блог', link: '/blog' },
          { text: 'Релізи', link: '/releases' },
          {
            items: [
              {
                text: 'Bluesky',
                link: 'https://bsky.app/profile/vite.dev',
              },
              {
                text: 'Mastodon',
                link: 'https://elk.zone/m.webtoo.ls/@vite',
              },
              {
                text: 'X',
                link: 'https://x.com/vite_js',
              },
              {
                text: 'Discord Chat',
                link: 'https://chat.vite.dev',
              },
              {
                text: 'Awesome Vite',
                link: 'https://github.com/vitejs/awesome-vite',
              },
              {
                text: 'ViteConf',
                link: 'https://viteconf.org',
              },
              {
                text: 'DEV Community',
                link: 'https://dev.to/t/vite',
              },
              {
                text: 'Changelog',
                link: 'https://github.com/vitejs/vite/blob/main/packages/vite/CHANGELOG.md',
              },
              {
                text: 'Contributing',
                link: 'https://github.com/vitejs/vite/blob/main/CONTRIBUTING.md',
              },
            ],
          },
        ],
      },
      {
        text: 'Версія',
        items: versionLinks,
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Посібник',
          items: [
            {
              text: 'Чому Vite',
              link: '/guide/why',
            },
            {
              text: 'Початок роботи',
              link: '/guide/',
            },
            {
              text: 'Особливості',
              link: '/guide/features',
            },
            {
              text: 'CLI',
              link: '/guide/cli',
            },
            {
              text: 'Використання плагінів',
              link: '/guide/using-plugins',
            },
            {
              text: 'Попереднє збирання залежностей',
              link: '/guide/dep-pre-bundling',
            },
            {
              text: 'Обробка статичних ресурсів',
              link: '/guide/assets',
            },
            {
              text: 'Збирання для продакшн',
              link: '/guide/build',
            },
            {
              text: 'Розгортання статичного сайту',
              link: '/guide/static-deploy',
            },
            {
              text: 'Змінні середовища та режими',
              link: '/guide/env-and-mode',
            },
            {
              text: 'Рендеринг на стороні сервера (SSR)',
              link: '/guide/ssr',
            },
            {
              text: 'Інтеграція з бекендом',
              link: '/guide/backend-integration',
            },
            {
              text: 'Порівняння',
              link: '/guide/comparisons',
            },
            {
              text: 'Вирішення проблем',
              link: '/guide/troubleshooting',
            },
            {
              text: 'Продуктивність',
              link: '/guide/performance',
            },
            {
              text: 'Філософія',
              link: '/guide/philosophy',
            },
            {
              text: 'Міграція з v5',
              link: '/guide/migration',
            },
            {
              text: 'Зміни, що ламають зворотну сумісність',
              link: '/changes/',
            },
          ],
        },
        {
          text: 'API',
          items: [
            {
              text: 'API плагінів',
              link: '/guide/api-plugin',
            },
            {
              text: 'API HMR',
              link: '/guide/api-hmr',
            },
            {
              text: 'JavaScript API',
              link: '/guide/api-javascript',
            },
            {
              text: 'Довідник конфігурації',
              link: '/config/',
            },
          ],
        },
        {
          text: 'API середовища',
          items: [
            {
              text: 'Вступ',
              link: '/guide/api-environment',
            },
            {
              text: 'Інстанси середовища',
              link: '/guide/api-environment-instances',
            },
            {
              text: 'Плагіни',
              link: '/guide/api-environment-plugins',
            },
            {
              text: 'Фреймворки',
              link: '/guide/api-environment-frameworks',
            },
            {
              text: 'Рантайми',
              link: '/guide/api-environment-runtimes',
            },
          ],
        },
      ],
      '/config/': [
        {
          text: 'Конфігурація',
          items: [
            {
              text: 'Налаштування Vite',
              link: '/config/',
            },
            {
              text: 'Загальні опції',
              link: '/config/shared-options',
            },
            {
              text: 'Опції сервера',
              link: '/config/server-options',
            },
            {
              text: 'Опції збірки',
              link: '/config/build-options',
            },
            {
              text: 'Опції попереднього перегляду',
              link: '/config/preview-options',
            },
            {
              text: 'Опції оптимізації залежностей',
              link: '/config/dep-optimization-options',
            },
            {
              text: 'Опції SSR',
              link: '/config/ssr-options',
            },
            {
              text: 'Опції воркерів',
              link: '/config/worker-options',
            },
          ],
        },
      ],
      '/changes/': [
        {
          text: 'Зміни, що ламають зворотну сумісність',
          link: '/changes/',
        },
        {
          text: 'Поточні',
          items: [],
        },
        {
          text: 'Майбутні',
          items: [
            {
              text: 'this.environment у хуках',
              link: '/changes/this-environment-in-hooks',
            },
            {
              text: 'HMR hotUpdate Plugin Hook',
              link: '/changes/hotupdate-hook',
            },
            {
              text: 'Перехід на API для кожного середовища',
              link: '/changes/per-environment-apis',
            },
            {
              text: 'SSR за допомогою ModuleRunner API',
              link: '/changes/ssr-using-modulerunner',
            },
            {
              text: 'Спільні плагіни під час збірки',
              link: '/changes/shared-plugins-during-build',
            },
          ],
        },
        {
          text: 'Минулі',
          items: [],
        },
      ],
    },

    outline: {
      level: [2, 3],
    },
  },
  transformPageData(pageData) {
    const canonicalUrl = `${ogUrl}/${pageData.relativePath}`
      .replace(/\/index\.md$/, '/')
      .replace(/\.md$/, '/')
    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.unshift(
      ['link', { rel: 'canonical', href: canonicalUrl }],
      ['meta', { property: 'og:title', content: pageData.title }],
    )
    return pageData
  },
  markdown: {
    codeTransformers: [transformerTwoslash()],
    config(md) {
      md.use(groupIconMdPlugin)
    },
  },
  vite: {
    plugins: [
      groupIconVitePlugin({
        customIcon: {
          firebase: 'vscode-icons:file-type-firebase',
          '.gitlab-ci.yml': 'vscode-icons:file-type-gitlab',
        },
      }),
    ],
    optimizeDeps: {
      include: [
        '@shikijs/vitepress-twoslash/client',
        'gsap',
        'gsap/dist/ScrollTrigger',
        'gsap/dist/MotionPathPlugin',
      ],
    },
  },
  buildEnd,
})
