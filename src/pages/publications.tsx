import React, { useState } from 'react';
import Layout from '@theme/Layout';
import PDFPreview from '@site/src/components/PDFPreview';
import Head from '@docusaurus/Head';

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
    background: 'rgba(255, 255, 255, 0.95)',
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
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid var(--ifm-color-primary-lightest)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  managerBox: {
    marginBottom: '1.5rem',
    background: 'rgba(255, 255, 255, 0.5)',
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
    background: 'rgba(255, 255, 255, 0.8)',
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
    background: 'rgba(255, 255, 255, 0.5)',
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
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '1rem',
    border: '1px solid var(--ifm-color-primary-lighter)',
  },
  statItem: {
    textAlign: 'center' as const,
    padding: '1rem',
    background: 'rgba(255, 255, 255, 0.5)',
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

interface Issue {
  title: string;
  fileId: string;
}

interface Editor {
  title: string;
  issues: Issue[];
}

interface Magazine {
  manager: string;
  editors: Editor[];
}

export const magazines: Magazine[] = [
  {
    manager: "فرهاد فرنود",
    editors: [
      {
        title: "شورای سردبیری",
        issues: [
          { title: "پیش‌شماره اول", fileId: "1sdqz2-Pya2nDM3QdJyv2cyIzAvcWyqMQ" }
        ]
      }
    ]
  },
  {
    manager: "محمد رسولی",
    editors: [
      {
        title: "",
        issues: [
          { title: "شماره ۱ (اسکن)", fileId: "1ZRzj8KklykiqQTnkx7WjBvjYe7Dfo4w9" }
        ]
      }
    ]
  },
  {
    manager: "علیرضا رضوان‌دوست",
    editors: [
      {
        title: "",
        issues: [
          { title: "شماره ۲", fileId: "1L4dNUtDIJrzOQQJx8EncTim29PgmGTJX" },
          { title: "شماره ؟ (اسکن)", fileId: "12TfkTjZWkJLCepp3_RPyOGcXqeTd9FRo" },
          { title: "شماره ۳", fileId: "11xSEux66_mKH4hjDQybCcbzZOSHpbhPP" },
          { title: "شماره ۴", fileId: "" },
          { title: "شماره ۵ (اسکن)", fileId: "1r-YveOXDSOpurT9aUtf2FrO_t9vBQqNl" },
          { title: "شماره ۶", fileId: "1bVT-KjEF_uxxn8t_IF73Ew9PzD7pEyf5" },
          { title: "شماره ۷", fileId: "1pSG-8nu74Hj3HP7SLAwWrXunCgVfQ68m" }
        ]
      },
      {
        title: "شورای سردبیری: بابک بهادری، فاطمه‌السادات میرباقری، سیدامیرحسین موسوی، جواد صالحی",
        issues: [
          { title: "شماره ۸", fileId: "1fg3GN455YpFtudw60_iPl5G3NHeAdUdv" }
        ]
      },
      {
        title: "شورای سردبیری: بابک بهادری، فاطمه‌السادات میرباقری، جواد صالحی سیدامیرحسین موسوی، حمید ملکی",
        issues: [
          { title: "شماره ۹", fileId: "1z4FzfLJ-cZc60-AES31uOG7zBgfI2ShE" }
        ]
      },
      {
        title: "شورای سردبیری",
        issues: [
          { title: "شماره ۱۰ (اسکن)", fileId: "1v1UWtOYmefk55zB46OtB2G-xwDX-exe6" },
          { title: "شماره ۱۱ (اسکن)", fileId: "161HeBfDDvYJc6LZ67EiGHVw9uV4YFIjf" },
          { title: "شماره ۱۱ (اسکن دوم)", fileId: "10KJJdTSMZTn0Zc8_ixxIMgxcuxcHnFs-" },
          { title: "شماره ۱۲", fileId: "1ivnTLcWKlOfw1vW-Jdd780ZHl0bsBNBK" },
          { title: "شماره ۱۳ (اسکن)", fileId: "1ECRqZKLblvtpUFIztSIaxUQ-SvRBiYW-" },
          { title: "ویژه‌نامه ورودی‌های جدید سال ۱۳۸۹", fileId: "1X7P6SKfD5rL7YPQEjQHVV8GQYilsJhWP" },
          { title: "شماره ۱۴", fileId: "1EWWcYn6hBcVXkPo_RVW1SJ3uW9BrEL1n" },
          { title: "شماره ۱۵", fileId: "12Xu0pPa4r1cSz7V8USqk3uhp-pPfuXb8" },
          { title: "شماره ۱۶ (اسکن)", fileId: "1AI_cycI9DwxCaE60sGVUbCa0RAvqhSMz" },
          { title: "شماره ۱۷ صفحه دوم ناموجود", fileId: "1ngZhJ533GKagJWzzRVIT3YIaPGxpoT72" },
          { title: "شماره ۱۸", fileId: "1wV5drUJS0KoGEwgWAXXZYNbCTTV4aL2P" },
          { title: "شماره ۱۹", fileId: "1-wLIJ2E3dvwWpfkuoSoswpL-ykSlYEQY" },
          { title: "شماره ۲۰", fileId: "1418wwmRuXyKzpzwS3Nni2KvVIl-bSzEO" },
          { title: "شماره ۲۱", fileId: "1He89PS1cz4cwW91tcSFq0e419FbbN7eI" },
          { title: "شماره ۲۲", fileId: "1G4HPCf7aaeg-07CjxOlaiyPOpgwm74sS" },
          { title: "شماره ۲۳", fileId: "1MP_FGQ9kuE8l9tuqLmp7k8pUf2wIxu6n" },
          { title: "شماره ۲۴", fileId: "17wuGeCcB37hWjwBaN7ScM974nElfBjW4" },
          { title: "شماره ۲۵", fileId: "1TqQMWvPFVDH6pzTF-iHc-JOOldHhz19J" },
          { title: "ویژه‌نامه ورودی‌های جدید سال ۱۳۹۰ (اسکن)", fileId: "1JEeh0eQGx1vXTyh9Uh3hwzkBU2gybOxW" },
          { title: "شماره ۲۶", fileId: "156lV4pLDK0RS0u_87dbRCfXFk4J4JON8" },
          { title: "شماره ۲۷", fileId: "1aXJU4D_xx3B4e7jy0G8qTmpKcEBZSsOK" },
          { title: "شماره ۲۸", fileId: "1Xj7xoCQUwOt5Hi7NUUi_Q1Z-pzmy-ewu" },
          { title: "شماره ۲۹", fileId: "122WlWH8XyK1QIPoKMVQBOMZ65nJoHIZL" },
          { title: "شماره ۳۰", fileId: "1bcW2DJHZhDF1NhyWQMZ3hpXfEQE4a3T5" },
          { title: "شماره ۳۱", fileId: "1yTOp8ydOEBBGorvke631xSQs9fURdCmg" },
          { title: "شماره ۳۲", fileId: "178FdwCsiGaCLtKCQWN0AHaky1dQo-Gnt" },
          { title: "شماره ۳۳", fileId: "1DHQweOlsj3fZB48si45A8DRyDk8b3Uuq" },
          { title: "شماره ۳۴", fileId: "19aRaz8QG5iFokIbT9yK-yDizGU839Inw" }
        ]
      }
    ]
  },
  {
    manager: "محمد عصاریان نیاسری",
    editors: [
      {
        title: "شورای سردبیری: محمدجواد اکبری، ساسان حاجی‌رضایی، آرمین ساعی",
        issues: [
          { title: "شماره ۳۵", fileId: "10Hpm9OBw3dPliswNKjEcsOl0BuBqogfo" }
        ]
      },
      {
        title: "سردبیر: ساسان حاجی‌رضایی",
        issues: [
          { title: "شماره ۳۶", fileId: "1aAOx8wv5n2CMyCGMLIbec9Ug29HDMhpx" }
        ]
      },
      {
        title: "شورای سردبیری: ساسان حاجی‌رضایی، آرمین ساعی",
        issues: [
          { title: "شماره ۳۷", fileId: "1_pVjHf74cpMj-2ifQY9ogs-Dp-p5Op__" }
        ]
      },
      {
        title: "شورای سردبیری",
        issues: [
          { title: "شماره ۳۸", fileId: "1mguz2TRUvuYWqYpZdXToB967YrjRpenZ" },
          { title: "ویژه‌نامه ورودی ۹۲ (اسکن)", fileId: "1oTeMYkM2cD9nqdgYDQ2jfIbhtIfMOlFS" }
        ]
      },
      {
        title: "سردبیر: ساسان حاجی‌رضایی",
        issues: [
          { title: "شماره ۳۹", fileId: "1yRocFFfBU3vFiUNfjbmgiA9k5SB_dSkN" },
          { title: "شماره ۴۰", fileId: "1RTix3RA9BX-zkN-gr-5PMcr9o_WaGTjj" },
          { title: "شماره ۴۱", fileId: "1fsWjWMBtWgHyrptjd3wzj-TS9OKa3kXN" },
          { title: "شماره ۴۲", fileId: "1Hu0dvG9F0GUZXP86FsSI8YWNGAP83858" }
        ]
      }
    ]
  },
  {
    manager: "مهدی سیلاوی",
    editors: [
      {
        title: "سردبیر: احسان حقی",
        issues: [
          { title: "شماره ۴۳", fileId: "1gpwi0CwFH2vosIceidokNuErk7Tz1C5j" },
          { title: "شماره ۴۴", fileId: "1eTUhITFdZ-z5jK_zV6o1SKgcWOaF8IJL" },
          { title: "شماره ۴۵", fileId: "1xO-_V5SwXCXZQjNLCwjBy5eZSzz55GQX" },
          { title: "شماره ۴۶", fileId: "1HvsZE66219N8E3Y__Ma1o2cCnRUKLPH0" },
          { title: "شماره ۴۷", fileId: "" },
          { title: "شماره ۴۸", fileId: "1vxuw8Gd28IdQMy46GpCD0KorOW61Uy9i" }
        ]
      }
    ]
  },
  {
    manager: "مرتضی ملکیان",
    editors: [
      {
        title: "سردبیر: پویا مصدق",
        issues: [
          { title: "شماره ۴۹", fileId: "11X0y5vSXYBN1hU5w92V7aEnPJ4Gc6oI4" },
          { title: "شماره ۵۰", fileId: "1BuSosKPWBbsbXtAIhArZXgaGSbo2fyQP" },
          { title: "شماره ۵۱", fileId: "1Tzedx9WfPxipboTG6_QTn3e9OHUn1q20" }
        ]
      },
      {
        title: "سردبیر: -",
        issues: [
          { title: "شماره ۵۲", fileId: "1UF2acjFo9Cdzpgqfgsy-GKr8gFOOdT0B" }
        ]
      }
    ]
  },
  {
    manager: "علی‌اکبر مومنی‌ملکشاه",
    editors: [
      {
        title: "سردبیر: امیرمحمد بائو دیزآبادی",
        issues: [
          { title: "شماره ۵۳", fileId: "1Gq7p-B9tKMQZ3_bgR6-GzYqozfXAWRhx" },
          { title: "ویژه‌نامه «سنوات ظالمانه»", fileId: "1FXVIs6grWP8-0w-sE_ijG31Z7jmcWfv2" },
          { title: "شماره ۵۴", fileId: "" },
          { title: "شماره ۵۵", fileId: "" }
        ]
      }
    ]
  },
  {
    manager: "فاطمه امینی",
    editors: [
      {
        title: "سردبیر: فاطمه امینی",
        issues: [
          { title: "شماره ۵۶", fileId: "1hM8Sq6oONCk588yfEWOklLbvS5qrZcMI" },
          { title: "شماره ۵۷", fileId: "1RkFvXXJio4hdFLCaefuDBnsIZm8jFg2v" },
          { title: "شماره ۵۸", fileId: "175j-XKZDv9yMjasl5U_BEbUVJeDXOIHu" },
          { title: "شماره ۵۹", fileId: "1ciGF82g_Vp4CvJ5DJeIEqsBl0F9uQ1nw" },
          { title: "شماره ۶۰", fileId: "19VW0LPVKOQJg_uGYgojHdORRrDbDXWaQ" },
          { title: "شماره ۶۱", fileId: "1zc7P8NWV5oGnU0n5r2fTUn1EJmNStcNs" },
          { title: "شماره ۶۲", fileId: "1P1yJaW3uRR_z40PjBXXBrtMH92uu1sfQ" },
          { title: "شماره ۶۳", fileId: "1YEnqVbGtgx7Ubj2N_EJ1yiYUduEbtxvH" },
          { title: "شماره ۶۴", fileId: "1qhESXmboCkDb7qXR-ma95P5aOfcOgLbf" },
          { title: "شماره ۶۵", fileId: "1xWXoQ8zmmZfTLGe4C52mOBPoBEOaSacN" },
          { title: "شماره ۶۶", fileId: "1qJUz5_QKz9rIeuj1xyCQ9ejMi4F3FcEW" }
        ]
      }
    ]
  },
  {
    manager: "آریا ترابی",
    editors: [
      {
        title: "سردبیر: سینا صفی‌زاده، میترا ملکی",
        issues: [
          { title: "شماره ۶۷", fileId: "177k-eYCmF46GOIHAoQmxxH6VFyw6qLW6" },
          { title: "شماره ۶۸", fileId: "1kXpYeZ9M5l0Gq0i4RtV55LsEBrEo_Dgi" },
          { title: "شماره ۶۹", fileId: "19a1W2peiPvjWkgjI_R1C-5WFKv7tv5hM" }
        ]
      },
      {
        title: "سردبیر: کیمیا نسترن",
        issues: [
          { title: "شماره ۷۰", fileId: "1UfoEnGx2i4jJPVC50TxIueHGfcEd-geN" },
          { title: "توصیه‌نامه و تاریخچه ادوار - جلد اول", fileId: "1FEy1Odh4uPc3jfwVC0h_PbnXlogCHac-" },
          { title: "توصیه‌نامه و تاریخچه ادوار - جلد اول - کم‌حجم", fileId: "1YQte9j1aU-iTloK2aLij6bBwM6bJm6lz" }
        ]
      }
    ]
  }
];

// کامپوننت آمار
function StatsPanel({ magazines }: { magazines: Magazine[] }) {
  const totalManagers = magazines.length;
  const totalEditors = magazines.reduce((acc, mag) => acc + mag.editors.length, 0);
  const totalIssues = magazines.reduce((acc, mag) => 
    acc + mag.editors.reduce((sum, ed) => sum + ed.issues.length, 0), 0);
  const availableIssues = magazines.reduce((acc, mag) => 
    acc + mag.editors.reduce((sum, ed) => 
      sum + ed.issues.filter(issue => issue.fileId).length, 0), 0);

  return (
    <div style={styles.statsContainer}>
      <div style={styles.statItem}>
        <div style={styles.statNumber}>👥 {totalManagers}</div>
        <div style={styles.statLabel}>مدیرمسئول</div>
      </div>
      <div style={styles.statItem}>
        <div style={styles.statNumber}>📝 {totalEditors}</div>
        <div style={styles.statLabel}>سردبیر</div>
      </div>
      <div style={styles.statItem}>
        <div style={styles.statNumber}>📄 {totalIssues}</div>
        <div style={styles.statLabel}>کل شماره‌ها</div>
      </div>
      <div style={styles.statItem}>
        <div style={styles.statNumber}>✅ {availableIssues}</div>
        <div style={styles.statLabel}>موجود</div>
      </div>
    </div>
  );
}

export default function Publications(): React.JSX.Element {
  const [currentPdf, setCurrentPdf] = useState<string | null>(null);
  const [managerOpen, setManagerOpen] = useState<number[]>([]);
  const [editorOpen, setEditorOpen] = useState<string[]>([]);

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
    <Layout title="نشریه شورا" description="آرشیو نشریات شورای صنفی دانشجویان دانشگاه صنعتی شریف">
      <Head>
        <title>نشریه شورا | شورای صنفی دانشجویان دانشگاه صنعتی شریف</title>
        <meta name="description" content="آرشیو نشریات شورای صنفی دانشجویان دانشگاه صنعتی شریف؛ نسخه پی‌دی‌اف همه شماره‌ها و اطلاعات مسئولان نشریه." />
        <meta property="og:image" content="https://senfi-sharif.ir/img/shora-og.png" />
        <meta property="og:title" content="نشریه شورای صنفی شریف" />
        <meta property="og:description" content="آرشیو نشریات شورا، به همراه همه شماره‌ها و لینک دانلود." />
        <meta property="og:url" content="https://senfi-sharif.ir/publications" />
      </Head>

      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>
            <span style={styles.headerIcon}>📰</span>
            نشریه شورا
          </h1>
          <p style={styles.headerSubtitle}>
            آرشیو نشریات شورای صنفی دانشجویان دانشگاه صنعتی شریف
          </p>
        </div>

        <StatsPanel magazines={magazines} />

        {currentPdf && (
          <div style={styles.pdfPreview}>
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

        <div style={styles.mainList}>
          {magazines.map((mag, i) => (
            <div style={styles.managerBox} key={i}>
              <button
                style={styles.managerButton}
                onClick={() => toggleManager(i)}
                onMouseEnter={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.background = 'linear-gradient(135deg, var(--ifm-color-primary-dark) 0%, var(--ifm-color-primary) 100%)';
                  target.style.transform = 'translateY(-1px)';
                  target.style.boxShadow = '0 4px 12px rgba(22, 51, 124, 0.3)';
                }}
                onMouseLeave={(e) => {
                  const target = e.target as HTMLButtonElement;
                  target.style.background = 'linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-light) 100%)';
                  target.style.transform = 'translateY(0)';
                  target.style.boxShadow = 'none';
                }}
              >
                <span>👤 مدیرمسئول: {mag.manager}</span>
                <span style={{
                  ...styles.managerIcon,
                  transform: managerOpen.includes(i) ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  ▼
                </span>
              </button>
              
              {managerOpen.includes(i) && mag.editors.map((ed, j) => (
                <div style={styles.editorBlock} key={j}>
                  <button
                    style={{
                      ...styles.editorButton,
                      ...(ed.title.toLowerCase().includes("داخلی") && styles.editorButtonGray)
                    }}
                    onClick={() => toggleEditor(i, j)}
                    onMouseEnter={(e) => {
                      const target = e.target as HTMLButtonElement;
                      if (ed.title.toLowerCase().includes("داخلی")) {
                        target.style.background = 'rgba(128, 128, 128, 0.15)';
                        target.style.color = '#444';
                      } else {
                        target.style.background = 'rgba(22, 51, 124, 0.05)';
                        target.style.color = 'var(--ifm-color-primary-darker)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const target = e.target as HTMLButtonElement;
                      if (ed.title.toLowerCase().includes("داخلی")) {
                        target.style.background = 'rgba(128, 128, 128, 0.1)';
                        target.style.color = '#666';
                      } else {
                        target.style.background = 'rgba(255, 255, 255, 0.8)';
                        target.style.color = 'var(--ifm-color-primary-dark)';
                      }
                    }}
                  >
                    <span>{ed.title ? ed.title : "(بدون عنوان سردبیر)"}</span>
                    <span style={{
                      ...styles.toggleIcon,
                      transform: editorOpen.includes(`${i}-${j}`) ? 'rotate(90deg)' : 'rotate(0deg)'
                    }}>
                      ▶
                    </span>
                  </button>
                  
                  {editorOpen.includes(`${i}-${j}`) && (
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
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 