import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  tutorialSidebar: [
    // Temporarily hidden - will be restored later
    // {
    //   type: 'doc',
    //   id: 'sharif-senfi-regulations',
    //   label: '📜 آیین‌نامه داخلی شورا',
    // },
    {
      type: 'category',
      label: '📚 راهنماهای کاربری',
      items: [
        'user-guide',
        'admin-guide',
      ],
    },
    {
      type: 'category',
      label: '🔧 مستندات فنی',
      items: [
        'api-reference',
      ],
    },
    {
      type: 'category',
      label: '❓ پشتیبانی',
      items: [
        'faq',
      ],
    },
    {
      type: 'doc',
      id: 'about-us',
      label: '👥 درباره ما',
    },
  ],
};

export default sidebars;
