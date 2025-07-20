import React, { useEffect } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import { FaBook, FaUsers, FaCode, FaQuestionCircle, FaArrowRight, FaFileAlt } from 'react-icons/fa';

export default function DocsPage() {
  useEffect(() => {
    // Redirect to Docusaurus docs after a short delay
    const timer = setTimeout(() => {
      window.location.href = '/docs/user-guide';
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const docSections = [
    {
      title: 'آیین‌نامه داخلی شورا',
      description: 'آیین‌نامه و مقررات داخلی شورای صنفی دانشجویان',
      icon: <FaFileAlt />,
      link: '/docs/sharif-senfi-regulations',
      color: 'var(--ifm-color-info)'
    },
    {
      title: 'راهنمای کاربری',
      description: 'راهنمای کامل استفاده از پلتفرم برای کاربران عادی',
      icon: <FaBook />,
      link: '/docs/user-guide',
      color: 'var(--ifm-color-primary)'
    },
    {
      title: 'راهنمای ادمین',
      description: 'راهنمای مدیریت و اداره پلتفرم برای ادمین‌ها',
      icon: <FaUsers />,
      link: '/docs/admin-guide',
      color: 'var(--ifm-color-success)'
    },
    {
      title: 'مرجع API',
      description: 'مستندات کامل API برای توسعه‌دهندگان',
      icon: <FaCode />,
      link: '/docs/api-reference',
      color: 'var(--ifm-color-warning)'
    },
    {
      title: 'سوالات متداول',
      description: 'پاسخ سوالات رایج کاربران پلتفرم',
      icon: <FaQuestionCircle />,
      link: '/docs/faq',
      color: 'var(--ifm-color-danger)'
    }
  ];

  return (
    <Layout title="اسناد و راهنما" description="اسناد و راهنمای کامل پلتفرم شورای صنفی دانشجویان شریف">
      <Head>
        <title>اسناد و راهنما | شورای صنفی دانشجویان دانشگاه صنعتی شریف</title>
        <meta name="description" content="اسناد و راهنمای کامل پلتفرم شورای صنفی دانشجویان دانشگاه صنعتی شریف" />
      </Head>
      
      <main className="docs-landing-page">
        <div className="docs-hero-section">
          <div className="docs-hero-content">
            <h1 className="docs-hero-title">📚 اسناد و راهنمای پلتفرم</h1>
            <p className="docs-hero-subtitle">
              راهنمای کامل استفاده از پلتفرم شورای صنفی دانشجویان دانشگاه صنعتی شریف
            </p>
            <div className="docs-hero-note">
              <p>در حال هدایت به راهنمای کاربری... <span className="loading-dots">...</span></p>
            </div>
          </div>
        </div>

        <div className="docs-sections-container">
          <h2 className="docs-sections-title">بخش‌های مختلف اسناد و راهنما</h2>
          <div className="docs-sections-grid">
            {docSections.map((section, index) => (
              <Link key={index} to={section.link} className="docs-section-card">
                <div className="docs-section-icon" style={{ color: section.color }}>
                  {section.icon}
                </div>
                <div className="docs-section-content">
                  <h3 className="docs-section-title">{section.title}</h3>
                  <p className="docs-section-description">{section.description}</p>
                </div>
                <div className="docs-section-arrow">
                  <FaArrowRight />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="docs-support-section">
          <h2>نیاز به کمک دارید؟</h2>
          <p>اگر سوال شما در مستندات پاسخ داده نشده، با ما تماس بگیرید:</p>
          <div className="docs-support-links">
            <a 
              href="https://t.me/sharif_senfi_dabir" 
              target="_blank" 
              rel="noopener noreferrer"
              className="docs-support-link"
            >
              💬 پشتیبانی تلگرام
            </a>
            <a 
              href="mailto:stu.senfi@sharif.edu" 
              className="docs-support-link"
            >
              📧 ارسال ایمیل
            </a>
          </div>
        </div>
      </main>

      <style>{`
        .docs-landing-page {
          min-height: 100vh;
          background: linear-gradient(135deg, var(--ifm-color-primary-lightest) 0%, var(--ifm-background-surface-color) 100%);
        }

        .docs-hero-section {
          padding: 4rem 2rem;
          text-align: center;
          background: linear-gradient(135deg, var(--ifm-color-primary) 0%, var(--ifm-color-primary-dark) 100%);
          color: white;
        }

        .docs-hero-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .docs-hero-title {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: bold;
        }

        .docs-hero-subtitle {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          opacity: 0.9;
        }

        .docs-hero-note {
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          border-radius: 8px;
          display: inline-block;
        }

        .loading-dots {
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          80%, 100% { opacity: 0; }
        }

        .docs-sections-container {
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .docs-sections-title {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: var(--ifm-color-primary-dark);
        }

        .docs-sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 4rem;
        }

        .docs-section-card {
          display: flex;
          align-items: center;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          text-decoration: none;
          color: inherit;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .docs-section-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
          border-color: var(--ifm-color-primary);
          text-decoration: none;
          color: inherit;
        }

        .docs-section-icon {
          font-size: 2.5rem;
          margin-left: 1rem;
          flex-shrink: 0;
        }

        .docs-section-content {
          flex: 1;
        }

        .docs-section-title {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: var(--ifm-color-primary-dark);
        }

        .docs-section-description {
          color: var(--ifm-font-color-secondary);
          line-height: 1.5;
        }

        .docs-section-arrow {
          color: var(--ifm-color-primary);
          font-size: 1.2rem;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .docs-section-card:hover .docs-section-arrow {
          opacity: 1;
        }

        .docs-support-section {
          text-align: center;
          padding: 4rem 2rem;
          background: var(--ifm-background-surface-color);
          border-top: 1px solid var(--ifm-color-emphasis-300);
        }

        .docs-support-section h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: var(--ifm-color-primary-dark);
        }

        .docs-support-section p {
          font-size: 1.1rem;
          margin-bottom: 2rem;
          color: var(--ifm-font-color-secondary);
        }

        .docs-support-links {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .docs-support-link {
          display: inline-flex;
          align-items: center;
          padding: 1rem 2rem;
          background: var(--ifm-color-primary);
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .docs-support-link:hover {
          background: var(--ifm-color-primary-dark);
          transform: translateY(-2px);
          text-decoration: none;
          color: white;
        }

        @media (max-width: 768px) {
          .docs-hero-title {
            font-size: 2rem;
          }

          .docs-hero-subtitle {
            font-size: 1rem;
          }

          .docs-sections-grid {
            grid-template-columns: 1fr;
          }

          .docs-section-card {
            flex-direction: column;
            text-align: center;
          }

          .docs-section-icon {
            margin-left: 0;
            margin-bottom: 1rem;
          }

          .docs-support-links {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </Layout>
  );
} 