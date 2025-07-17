import React, { useState } from 'react';
import Layout from '@theme/Layout';
import PDFPreview from '@site/src/components/PDFPreview';
import Head from '@docusaurus/Head';
import { useColorMode } from '@docusaurus/theme-common';
import { magazines, Magazine } from '@site/src/data/magazines';
import SenfiAccordion from '../components/SenfiAccordion';

// استایل‌های مدرن و بهبود یافته
const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '2rem 1rem',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '3rem',
    padding: '2rem',
    background: 'linear-gradient(120deg, var(--ifm-color-primary-lightest) 0%, transparent 80%)',
    borderRadius: '1rem',
    border: '1px solid var(--ifm-color-primary-lighter)',
  },
  headerTitle: {
    fontSize: '2.5rem',
    fontWeight: 700,
    color: 'var(--ifm-color-primary-darker)',
    margin: '0 0 0.5rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  headerIcon: {
    fontSize: '2.5rem',
    background: 'linear-gradient(120deg, #fff3 25%, var(--ifm-color-primary-lighter))',
    borderRadius: '50%',
    boxShadow: '0 2px 17px var(--ifm-color-primary-lightest)',
    padding: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSubtitle: {
    fontSize: '1.1rem',
    color: 'var(--ifm-color-primary-dark)',
    opacity: 0.8,
    margin: 0,
    fontWeight: 500,
  },
  pdfPreview: {
    position: 'sticky' as const,
    top: '1rem',
    borderRadius: '1rem',
    padding: '1rem',
    marginBottom: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--ifm-color-primary-lightest)',
    zIndex: 10,
    maxWidth: '100%',
    maxHeight: '75vh',
    overflow: 'hidden',
  },
  closeButton: {
    background: 'linear-gradient(90deg, #ef9a9a 70%, #ffe0e4)',
    color: '#b71c1c',
    border: 'none',
    padding: '0.5rem 1.5rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.9rem',
    marginTop: '1rem',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(239, 154, 154, 0.3)',
  },
  mainList: {
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid var(--ifm-color-primary-lightest)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  managerBox: {
    marginBottom: '1.5rem',
    borderRadius: '0.8rem',
    border: '1px solid var(--ifm-color-primary-lightest)',
    overflow: 'hidden',
  },
  managerButton: {
    width: '100%',
    background: 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-light) 100%)',
    color: '#fff',
    border: 'none',
    padding: '1rem 1.5rem',
    fontSize: '1.1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'right' as const,
  },
  managerIcon: {
    fontSize: '1.2rem',
    transition: 'transform 0.3s ease',
  },
  editorBlock: {
    borderTop: '1px solid var(--ifm-color-primary-lightest)',
  },
  editorButton: {
    width: '100%',
    color: 'var(--ifm-color-primary-dark)',
    border: 'none',
    padding: '0.8rem 1.5rem',
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'right' as const,
    borderBottom: '1px solid var(--ifm-color-primary-lightest)',
  },
  editorButtonGray: {
    background: 'rgba(128, 128, 128, 0.1)',
    color: '#666',
  },
  toggleIcon: {
    fontSize: '1rem',
    transition: 'transform 0.3s ease',
  },
  issuesList: {
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
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
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    textAlign: 'right' as const,
  },
  issueIcon: {
    fontSize: '1rem',
    opacity: 0.8,
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
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
    padding: '1.5rem',
    borderRadius: '1rem',
    border: '1px solid var(--ifm-color-primary-lighter)',
  },
  statItem: {
    textAlign: 'center' as const,
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid var(--ifm-color-primary-lightest)',
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--ifm-color-primary)',
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: 'var(--ifm-color-primary-dark)',
    fontWeight: 500,
  },
};

// کامپوننت آمار
function StatsPanel({ magazines, bgStats, borderStats, bgStatItem, borderStatItem, colorStatNumber, colorStatLabel }: { magazines: Magazine[], bgStats: string, borderStats: string, bgStatItem: string, borderStatItem: string, colorStatNumber: string, colorStatLabel: string }) {
  const totalManagers = magazines.length;
  const totalEditors = magazines.reduce((acc, mag) => acc + mag.editors.length, 0);
  const totalIssues = magazines.reduce((acc, mag) => 
    acc + mag.editors.reduce((sum, ed) => sum + ed.issues.length, 0), 0);
  const availableIssues = magazines.reduce((acc, mag) => 
    acc + mag.editors.reduce((sum, ed) => 
      sum + ed.issues.filter(issue => issue.fileId).length, 0), 0);

  return (
    <div style={{ ...styles.statsContainer, background: bgStats, border: borderStats }}>
      <div style={{ ...styles.statItem, background: bgStatItem, border: borderStatItem, color: colorStatNumber }}>
        <div style={styles.statNumber}>👥 {totalManagers}</div>
        <div style={styles.statLabel}>مدیرمسئول</div>
      </div>
      <div style={{ ...styles.statItem, background: bgStatItem, border: borderStatItem, color: colorStatNumber }}>
        <div style={styles.statNumber}>📝 {totalEditors}</div>
        <div style={styles.statLabel}>سردبیر</div>
      </div>
      <div style={{ ...styles.statItem, background: bgStatItem, border: borderStatItem, color: colorStatNumber }}>
        <div style={styles.statNumber}>📄 {totalIssues}</div>
        <div style={styles.statLabel}>کل شماره‌ها</div>
      </div>
      <div style={{ ...styles.statItem, background: bgStatItem, border: borderStatItem, color: colorStatNumber }}>
        <div style={styles.statNumber}>✅ {availableIssues}</div>
        <div style={styles.statLabel}>موجود</div>
      </div>
    </div>
  );
}

function PublicationsContent() {
  const [currentPdf, setCurrentPdf] = useState<string | null>(null);
  const [managerOpen, setManagerOpen] = useState<number[]>([]);
  const [editorOpen, setEditorOpen] = useState<string[]>([]);
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';

  // Dynamic style helpers
  const bgMain = isDark ? 'rgba(20,22,34,0.98)' : 'rgba(255,255,255,0.8)';
  const borderMain = isDark ? '1px solid #637eda' : '1px solid var(--ifm-color-primary-lightest)';
  const bgHeader = isDark ? 'linear-gradient(120deg, #23263a 0%, #181a23 100%)' : styles.header.background ?? undefined;
  const colorHeader = isDark ? 'var(--ifm-color-primary-lightest)' : styles.headerTitle.color ?? undefined;
  const bgPdf = isDark ? 'rgba(30,34,54,0.95)' : styles.pdfPreview.background ?? undefined;
  const borderPdf = isDark ? '1px solid #637eda' : styles.pdfPreview.border;
  const bgMainList = isDark ? 'rgba(30,34,54,0.95)' : styles.mainList.background ?? undefined;
  const borderMainList = isDark ? '1px solid #637eda' : styles.mainList.border;
  const bgManagerBox = isDark ? 'rgba(40,44,64,0.95)' : styles.managerBox.background ?? undefined;
  const borderManagerBox = isDark ? '1px solid #637eda' : styles.managerBox.border;
  const bgEditorButton = isDark ? 'rgba(30,34,54,0.85)' : styles.editorButton.background ?? undefined;
  const colorEditorButton = isDark ? 'var(--ifm-color-primary-lightest)' : styles.editorButton.color ?? undefined;
  const borderEditorButton = isDark ? '1px solid #637eda' : styles.editorButton.border;
  const bgStats = isDark ? 'rgba(20,22,34,0.98)' : styles.statsContainer.background ?? undefined;
  const borderStats = isDark ? '1px solid #637eda' : styles.statsContainer.border;
  const bgStatItem = isDark ? 'rgba(30,34,54,0.95)' : styles.statItem.background ?? undefined;
  const borderStatItem = isDark ? '1px solid #637eda' : styles.statItem.border;
  const colorStatNumber = isDark ? 'var(--ifm-color-primary-light)' : styles.statNumber.color ?? undefined;
  const colorStatLabel = isDark ? 'var(--ifm-color-primary-lightest)' : styles.statLabel.color ?? undefined;

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

  return (
    <div style={{ 
      ...styles.container, 
      ...(bgMain && {background: bgMain}), 
      border: borderMain 
    }}>
      <div style={{ 
        ...styles.header, 
        ...(bgHeader && {background: bgHeader}), 
        ...(colorHeader && {color: colorHeader}) 
      }}>
        <h1 style={{ 
          ...styles.headerTitle, 
          ...(colorHeader && {color: colorHeader}) 
        }}>
          <span style={styles.headerIcon}>📰</span>
          نشریه شورا
        </h1>
        <p style={styles.headerSubtitle}>
          آرشیو نشریات شورای صنفی دانشجویان دانشگاه صنعتی شریف
        </p>
      </div>

      <StatsPanel magazines={magazines} bgStats={bgStats} borderStats={borderStats} bgStatItem={bgStatItem} borderStatItem={borderStatItem} colorStatNumber={colorStatNumber} colorStatLabel={colorStatLabel} />

      {currentPdf && (
        <div style={{ 
          ...styles.pdfPreview, 
          ...(bgPdf && {background: bgPdf}), 
          border: borderPdf 
        }}>
          <PDFPreview fileId={currentPdf} />
          <div style={{ textAlign: 'left', marginTop: '1rem' }}>
            <button 
              style={styles.closeButton}
              onClick={() => setCurrentPdf(null)}
              onMouseEnter={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = '#ffd2dd';
                target.style.transform = 'translateY(-1px)';
                target.style.boxShadow = '0 4px 12px rgba(239, 154, 154, 0.4)';
              }}
              onMouseLeave={(e) => {
                const target = e.target as HTMLButtonElement;
                target.style.background = 'linear-gradient(90deg, #ef9a9a 70%, #ffe0e4)';
                target.style.transform = 'translateY(0)';
                target.style.boxShadow = '0 2px 8px rgba(239, 154, 154, 0.3)';
              }}
            >
              ✕ بستن
            </button>
          </div>
        </div>
      )}

      <div style={{ 
        ...styles.mainList, 
        ...(bgMainList && {background: bgMainList}), 
        border: borderMainList 
      }}>
        {magazines.map((mag, i) => (
          <SenfiAccordion
            key={i}
            title={`👤 مدیرمسئول: ${mag.manager}`}
            icon={null}
            defaultOpen={managerOpen.includes(i)}
            styleOverrides={{}}
            // اگر خواستی می‌توانی onToggle هم اضافه کنی
          >
            {mag.editors.map((ed, j) => (
              <SenfiAccordion
                key={j}
                title={ed.title ? ed.title : "(بدون عنوان سردبیر)"}
                icon={null}
                defaultOpen={editorOpen.includes(`${i}-${j}`)}
                styleOverrides={{}}
              >
                {/* محتوای شماره‌ها و ... */}
                <ul style={styles.issuesList}>
                  {ed.issues.map((issue, k) => (
                    <li style={styles.issueItem} key={k}>
                      {issue.fileId ? (
                        <button 
                          style={styles.issueButton}
                          onClick={() => setCurrentPdf(issue.fileId)}
                          onMouseEnter={(e) => {
                            const target = e.target as HTMLButtonElement;
                            target.style.background = 'rgba(22, 51, 124, 0.05)';
                            target.style.color = 'var(--ifm-color-primary-darker)';
                            target.style.transform = 'translateX(-5px)';
                          }}
                          onMouseLeave={(e) => {
                            const target = e.target as HTMLButtonElement;
                            target.style.background = 'transparent';
                            target.style.color = 'var(--ifm-color-primary-dark)';
                            target.style.transform = 'translateX(0)';
                          }}
                        >
                          <span style={styles.issueIcon}>📄</span>
                          {issue.title}
                        </button>
                      ) : (
                        <div style={styles.issueMissing}>
                          <span style={styles.issueIcon}>🚫</span>
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
      <PublicationsContent />
    </Layout>
  );
} 