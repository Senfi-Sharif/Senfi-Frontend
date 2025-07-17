import React, { useState } from 'react';
import Layout from '@theme/Layout';
import PDFPreview from '@site/src/components/PDFPreview';
import Head from '@docusaurus/Head';
import { useColorMode } from '@docusaurus/theme-common';
import { magazines, Magazine } from '@site/src/data/magazines';
import SenfiAccordion from '../components/SenfiAccordion';
import StatsPanel from '../components/StatsPanel';
import { container as sharedContainer } from '../theme/sharedStyles';

// حذف استایل‌های بلااستفاده و انتقال استایل‌های عمومی به sharedStyles
const styles = {
  issueItem: {
    borderBottom: '1px solid var(--ifm-color-primary-lightest)',
  },
  issueButton: {
    width: '100%',
    background: 'transparent',
    color: 'var(--ifm-color-primary-dark)',
    border: 'none',
    padding: '0.8rem 1.5rem',
    fontSize: '0.95rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textAlign: 'right' as const,
  },
  issueMissing: {
    width: '100%',
    background: 'rgba(244, 67, 54, 0.1)',
    color: '#b71c1c',
    border: 'none',
    padding: '0.8rem 1.5rem',
    fontSize: '0.95rem',
    cursor: 'not-allowed',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textAlign: 'right' as const,
    opacity: 0.7,
  },
};

function PublicationsContent() {
  const [currentPdf, setCurrentPdf] = useState<string | null>(null);
  const [managerOpen, setManagerOpen] = useState<number[]>([]);
  const [editorOpen, setEditorOpen] = useState<string[]>([]);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Dynamic style helpers
  const bgMain = isDark ? 'rgba(20,22,34,0.98)' : 'rgba(255,255,255,0.8)';
  const borderMain = isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)';
  const bgHeader = isDark ? 'linear-gradient(120deg, #23263a 0%, #181a23 100%)' : undefined;
  const colorHeader = isDark ? 'var(--ifm-color-primary-lightest)' : undefined;
  const bgPdf = isDark ? 'rgba(30,34,54,0.95)' : undefined;
  const borderPdf = isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)';
  const bgMainList = isDark ? 'rgba(30,34,54,0.95)' : undefined;
  const borderMainList = isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)';
  const bgStats = isDark ? 'rgba(20,22,34,0.98)' : undefined;
  const borderStats = isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)';
  const bgStatItem = isDark ? 'rgba(30,34,54,0.95)' : undefined;
  const borderStatItem = isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)';
  const colorStatNumber = isDark ? 'var(--ifm-color-primary-light)' : undefined;
  const colorStatLabel = isDark ? 'var(--ifm-color-primary-lightest)' : undefined;

  const toggleManager = (idx: number) => setManagerOpen(opened =>
    opened.includes(idx) ? opened.filter(i => i !== idx) : [...opened, idx]
  );

  const toggleEditor = (midx: number, eidx: number) => {
    const key = `${midx}-${eidx}`;
    setEditorOpen(opened =>
      opened.includes(key)
        ? opened.filter(i => i !== key)
        : [...opened, key]
    );
  };

  const totalManagers = magazines.length;
  const totalEditors = magazines.reduce((acc, mag) => acc + mag.editors.length, 0);
  const totalIssues = magazines.reduce((acc, mag) => 
    acc + mag.editors.reduce((sum, ed) => sum + ed.issues.length, 0), 0);
  const availableIssues = magazines.reduce((acc, mag) => 
    acc + mag.editors.reduce((sum, ed) => 
      sum + ed.issues.filter(issue => issue.fileId).length, 0), 0);

  return (
    <div style={sharedContainer}>
      <StatsPanel
        stats={[
          { icon: '👥', label: 'مدیرمسئول', value: totalManagers },
          { icon: '📝', label: 'سردبیر', value: totalEditors },
          { icon: '📄', label: 'کل شماره‌ها', value: totalIssues },
          { icon: '✅', label: 'موجود', value: availableIssues },
        ]}
      />
      {/* حذف هدر گرافیکی و استایل‌های اضافی */}
      {currentPdf && (
        <div style={{ marginBottom: '2rem' }}>
          <PDFPreview fileId={currentPdf} />
          <div style={{ textAlign: 'left', marginTop: '1rem' }}>
            <button 
              style={{ padding: '0.5rem 1.5rem', borderRadius: '0.5rem', border: 'none', background: '#eee', color: '#b71c1c', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              onClick={() => setCurrentPdf(null)}
            >
              ✕ بستن
            </button>
          </div>
        </div>
      )}
      <div>
        {magazines.map((mag, i) => (
          <SenfiAccordion
            key={i}
            title={`👤 مدیرمسئول: ${mag.manager}`}
            icon={null}
            defaultOpen={managerOpen.includes(i)}
            styleOverrides={{}}
          >
            {mag.editors.map((ed, j) => (
              <SenfiAccordion
                key={j}
                title={ed.title ? ed.title : "(بدون عنوان سردبیر)"}
                icon={null}
                defaultOpen={editorOpen.includes(`${i}-${j}`)}
                styleOverrides={{}}
              >
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {ed.issues.map((issue, k) => (
                    <li key={k} style={{ borderBottom: '1px solid var(--ifm-color-primary-lightest)' }}>
                      {issue.fileId ? (
                        <button 
                          style={{ width: '100%', background: 'transparent', color: 'var(--ifm-color-primary-dark)', border: 'none', padding: '0.8rem 1.5rem', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'right' }}
                          onClick={() => setCurrentPdf(issue.fileId)}
                        >
                          <span style={{ fontSize: '1rem', opacity: 0.8 }}>📄</span>
                          {issue.title}
                        </button>
                      ) : (
                        <div style={{ width: '100%', background: 'rgba(244, 67, 54, 0.1)', color: '#b71c1c', border: 'none', padding: '0.8rem 1.5rem', fontSize: '0.95rem', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', textAlign: 'right', opacity: 0.7 }}>
                          <span style={{ fontSize: '1rem', opacity: 0.8 }}>🚫</span>
                          {issue.title}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </SenfiAccordion>
            ))}
          </SenfiAccordion>
        ))}
      </div>
    </div>
  );
}

function PublicationsContentWrapper() {
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
        <PublicationsContent />
      </div>
    </div>
  );
}

export default function Publications() {
  return (
    <Layout title="نشریه شورا" description="آرشیو نشریات شورای صنفی دانشجویان دانشگاه صنعتی شریف">
      <Head>
        <title>نشریه شورا | شورای صنفی دانشجویان دانشگاه صنعتی شریف</title>
        <meta name="description" content="آرشیو نشریات شورای صنفی دانشجویان دانشگاه صنعتی شریف؛ نسخه پی‌دی‌اف همه شماره‌ها و اطلاعات مسئولان نشریه." />
        <meta property="og:image" content="https://senfi-sharif.ir/img/shora-og.png" />
        <meta property="og:title" content="نشریه شورای صنفی شریف" />
        <meta property="og:description" content="آرشیو نشریات شورا، به همراه همه شماره‌ها و لینک دانلود." />
        <meta property="og:url" content="https://senfi-sharif.ir/publications" />
      </Head>
      <PublicationsContentWrapper />
    </Layout>
  );
} 