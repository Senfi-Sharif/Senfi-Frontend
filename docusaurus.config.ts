import dotenv from 'dotenv';
dotenv.config();
import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'شورای صنفی دانشجویان',
  tagline: ' در دست ساخت ⏱️',
  favicon: 'img/maini_colors.png',
  future: { v4: true },
  url: 'https://senfi-sharif.ir',
  baseUrl: '/',
  organizationName: 'aryatrb',
  projectName: 'senfi.sharif.ir',
  onBrokenLinks: 'throw',
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
        // 👇👇 حذف کامل این بخش!
        // gtag: {
        //   trackingID: 'G-3Y3WE0GLKY',
        //   anonymizeIP: false,
        // },
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
          editUrl: 'https://github.com/senfi-sharif/senfi-sharif.ir/tree/main/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {    
    image: 'img/maini_colors.png',
    scripts: [
      '/custom.js',
      '/security-headers.js'
    ],
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
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
      copyright: `کپی‌رایت © ${new Date().getFullYear()} آریا ترابی. ساخته‌شده با داکوساروس.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    }
  } satisfies Preset.ThemeConfig,
};

export default config;
