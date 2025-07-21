import dotenv from 'dotenv';
dotenv.config();
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const ENABLE_ALGOLIA = process.env.ENABLE_ALGOLIA === 'true';

const config: Config = {
  title: 'شورای صنفی دانشجویان',
  tagline: ' در دست ساخت ⏱️',
  favicon: 'img/maini_colors.png',
  future: { v4: true },
  url: 'https://senfi-sharif.ir',
  baseUrl: '/',
  organizationName: 'aryatrb',
  projectName: 'senfi.sharif.ir',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  i18n: {
    defaultLocale: 'fa',
    locales: ['fa'],
    localeConfigs: { fa: { label: 'فارسی', direction: 'rtl' } },
  },
  customFields: {
    apiUrl: process.env.REACT_APP_API_BASE || 'https://api.senfi-sharif.ir',
  },
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          editUrl: 'https://github.com/senfi-sharif/senfi-sharif.ir/tree/main/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: false, // Disable default blog to use custom blog pages
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],

  // Algolia DocSearch config (disabled by default, enable by setting ENABLE_ALGOLIA=true in .env)
  themeConfig: {
    image: 'img/maini_colors.png',
    scripts: [
      '/custom.js',
      '/security-headers.js'
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    navbar: {
      hideOnScroll: true,
    },
    footer: {
      style: 'dark',
      links: [
        { title: 'Telegram channels', items: [
          { label: 'sharif_senfi@', to: 'https://t.me/sharif_senfi' },
          { label: 'sharif_senfi_media@', to: 'https://t.me/sharif_senfi_media' },
        ]},
        { title: 'Telegram Groups', items: [
          { label: 'مسائل صنفی دانشگاه شریف', href: 'https://t.me/shora_sharif' },
        ]},
        { title: 'تماس با ما', items: [
          { label: 'پشتیبانی تلگرام', to: 'https://t.me/sharif_senfi_dabir' },
          { label: 'stu.senfi@sharif.edu', href: 'mailto:stu.senfi@sharif.edu' },
        ]},
      ],
      copyright: `کپی‌رایت © ${new Date().getFullYear()} آریا ترابی. ساخته‌شده با داکوساروس.<br/>باتشکر از امیرحسین محمدزاده`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    ...(ENABLE_ALGOLIA ? {
      algolia: {
        appId: process.env.ALGOLIA_APP_ID || 'YOUR_APP_ID',
        apiKey: process.env.ALGOLIA_API_KEY || 'YOUR_SEARCH_API_KEY',
        indexName: process.env.ALGOLIA_INDEX_NAME || 'YOUR_INDEX_NAME',
        contextualSearch: true,
        searchParameters: {},
        searchPagePath: 'search',
      },
    } : {}),
  } satisfies Preset.ThemeConfig,
};

export default config;
