import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import FamilyTree from '@site/src/components/FamilyTree';

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

      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '2rem 1rem',
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '1rem',
          padding: '2rem',
          border: '1px solid var(--ifm-color-primary-lightest)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}>
          <FamilyTree />
        </div>
      </div>
    </Layout>
  );
} 