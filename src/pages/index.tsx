import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { FaTree, FaRegNewspaper, FaBullhorn } from 'react-icons/fa';



// کامپوننت Hero Section
function HeroSection() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <section className="home-hero-section">
      <div className="home-hero-overlay" />
      <div className="home-hero-content">
        <h1 className="home-hero-title">{siteConfig.title}</h1>
        <p className="home-hero-subtitle">
          پیگیر تمامی مسائل مربوط به صنف دانشجو
        </p>
        <div className="home-hero-buttons">
          <Link
            to="/tree"
            className="home-hero-button home-hero-primary-button"
          >
            شجره‌نامه شورا
          </Link>
          <Link
            to="/publications"
            className="home-hero-button home-hero-secondary-button"
          >
            نشریه شورا
          </Link>
        </div>
      </div>
    </section>
  );
}

// کامپوننت Publications
function PublicationsSection() {
  const publications = [
    {
      title: 'توصیه‌نامه و تاریخچه ادوار: جلد دوم',
      image: require('@site/static/img/pub_mainpages/advar2.jpg').default,
      status: 'coming-soon'
    },
    {
      title: 'توصیه‌نامه و تاریخچه ادوار: جلد اول',
      image: require('@site/static/img/pub_mainpages/advar1.jpg').default,
      status: 'download',
      link: 'https://t.me/sharif_senfi/3157'
    },
    {
      title: 'شماره ۷۱ام نشریه شورا',
      image: require('@site/static/img/pub_mainpages/pub71.jpg').default,
      status: 'download',
      link: 'https://t.me/sharif_senfi/3164'
    }
  ];

  return (
    <section className="home-publications-section">
      <div className="home-features-container">
        <h2 className="home-section-title">نشریات و انتشارات</h2>
        <div className="home-features-grid">
          {publications.map((pub, index) => (
            <div
              key={index}
              className="home-feature-card"
            >
              <div className="home-feature-image-container">
                <img src={pub.image} alt={pub.title} className="home-feature-image" />
              </div>
              <div className="home-feature-content">
                <h3 className="home-feature-title">{pub.title}</h3>
                {pub.status === 'download' ? (
                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-download-link"
                  >
                    دانلود
                  </a>
                ) : (
                  <span className="home-coming-soon">به‌زودی</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// کامپوننت آمار
function StatsSection() {
  const stats = [
    { number: '۷۱', label: 'شماره نشریه' },
    { number: '۲۰', label: 'واحد دانشکده' },
    { number: '۲۵+', label: 'سال سابقه' }
  ];

  return (
    <section className="home-stats-section">
      <div className="home-stats-container">
        {stats.map((stat, index) => (
          <div key={index} className="home-stat-item">
            <div className="home-stat-number">{stat.number}</div>
            <div className="home-stat-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// کامپوننت لینک‌های سریع
function QuickLinksSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      setIsLoggedIn(Boolean(token));
    }
  }, []);

  const allQuickLinks = [
    {
      icon: <FaTree />,
      title: 'شجره‌نامه',
      description: 'تاریخچه و ساختار شورای صنفی',
      link: '/tree'
    },
    {
      icon: <FaRegNewspaper />,
      title: 'نشریه شورا',
      description: 'آرشیو کامل نشریات',
      link: '/publications'
    },
    {
      icon: <FaBullhorn />,
      title: 'کارزارها',
      description: 'کارزارهای فعال و گذشته',
      link: '/campaigns',
      requiresAuth: true
    }
  ];

  // فیلتر کردن لینک‌ها بر اساس وضعیت احراز هویت
  const quickLinks = allQuickLinks.filter(link => 
    !link.requiresAuth || isLoggedIn
  );

  return (
    <section className="home-quick-links-section">
      <div className="home-features-container">
        <h2 className="home-section-title">دسترسی سریع</h2>
        <div className="home-quick-links-grid">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.link}
              className="home-quick-link-card"
            >
              <div className="home-quick-link-icon">{link.icon}</div>
              <h3 className="home-quick-link-title">{link.title}</h3>
              <p className="home-quick-link-description">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Custom hook to detect dark mode live
function useIsDarkMode() {
  const [isDark, setIsDark] = useState(
    typeof window !== 'undefined'
      ? document.documentElement.getAttribute('data-theme') === 'dark'
      : false
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.getAttribute('data-theme') === 'dark');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

// صفحه اصلی
export default function Home() {
  const isDark = useIsDarkMode();
  return (
    <Layout description="شورای صنفی دانشجویان دانشگاه صنعتی شریف - نماینده رسمی دانشجویان در امور صنفی و رفاهی">
      <HeroSection />
      <PublicationsSection />
      <StatsSection />
      <QuickLinksSection />
    </Layout>
  );
}
