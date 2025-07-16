import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import FamilyTree from '@site/src/components/FamilyTree';
import { useColorMode } from '@docusaurus/theme-common';
import { useEffect, useState } from 'react';

function TreeContent() {
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  const bg = isDark ? 'rgba(20,22,34,0.98)' : 'rgba(255,255,255,0.8)';
  const border = isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)';
  const boxShadow = isDark ? '0 4px 20px rgba(99,126,218,0.10)' : '0 4px 20px rgba(0,0,0,0.1)';

  return (
    <div style={{
      maxWidth: 1400,
      margin: '0 auto',
      padding: '2rem 1rem',
    }}>
      <div style={{
        background: bg,
        borderRadius: '1rem',
        padding: '2rem',
        border: border,
        boxShadow: boxShadow,
      }}>
        <FamilyTree />
      </div>
    </div>
  );
}

export default function TreePage() {
  return (
    <Layout title="شجره‌نامه شورا" description="تاریخچه کامل ادوار، کارگروه‌ها و واحدهای شورای صنفی دانشجویان شریف">
      <Head>
        <title>شجره‌نامه شورا | شورای صنفی دانشجویان دانشگاه صنعتی شریف</title>
        <meta name="description" content="تاریخچه کامل ادوار، کارگروه‌ها و واحدهای شورای صنفی دانشجویان دانشگاه صنعتی شریف" />
        <meta property="og:image" content="https://senfi-sharif.ir/img/shora-og.png" />
        <meta property="og:title" content="شجره‌نامه شورای صنفی شریف" />
        <meta property="og:description" content="تاریخچه کامل ادوار، کارگروه‌ها و واحدهای شورا" />
        <meta property="og:url" content="https://senfi-sharif.ir/tree" />
      </Head>
      <TreeContent />
    </Layout>
  );
} 