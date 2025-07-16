import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

// استایل‌های مشترک
const styles = {
  heroSection: {
    background: 'linear-gradient(120deg, var(--ifm-color-primary-lightest) 0%, transparent 80%)',
    color: 'var(--ifm-color-primary-darker)',
    padding: '4rem 2rem',
    textAlign: 'center' as const,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    minHeight: '60vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.1)',
    zIndex: 1,
  },
  heroContent: {
    position: 'relative' as const,
    zIndex: 2,
    maxWidth: 800,
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 700,
    marginBottom: '1rem',
    color: 'var(--ifm-color-primary-darker)',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  heroSubtitle: {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    color: 'var(--ifm-color-primary-dark)',
    lineHeight: 1.6,
    opacity: 0.9,
  },
  heroButtons: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    flexWrap: 'wrap' as const,
  },
  heroButton: {
    padding: '0.8rem 2rem',
    borderRadius: '2rem',
    textDecoration: 'none',
    fontWeight: 600,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    border: '2px solid transparent',
  },
  primaryButton: {
    background: 'var(--ifm-color-primary)',
    color: '#fff',
  },
  secondaryButton: {
    background: 'transparent',
    color: 'var(--ifm-color-primary)',
    borderColor: 'var(--ifm-color-primary)',
  },
  featuresSection: {
    padding: '4rem 2rem',
    background: '#f8f9fa',
  },
  featuresContainer: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  sectionTitle: {
    textAlign: 'center' as const,
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '3rem',
    color: '#333',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    marginTop: '2rem',
  },
  featureCard: {
    background: '#fff',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    textAlign: 'center' as const,
    border: '1px solid #e9ecef',
  },
  featureCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
  featureImage: {
    width: '100%',
    maxWidth: 200,
    height: 'auto',
    borderRadius: '0.5rem',
    marginBottom: '1rem',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  featureTitle: {
    fontSize: '1.3rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#333',
  },
  featureDescription: {
    fontSize: '1rem',
    color: '#666',
    lineHeight: 1.6,
    marginBottom: '1rem',
  },
  downloadLink: {
    display: 'inline-block',
    padding: '0.6rem 1.5rem',
    background: 'var(--ifm-color-primary)',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '1.5rem',
    fontWeight: 600,
    transition: 'all 0.3s ease',
  },
  downloadLinkHover: {
    background: 'var(--ifm-color-primary-dark)',
    transform: 'scale(1.05)',
  },
  comingSoon: {
    display: 'inline-block',
    padding: '0.6rem 1.5rem',
    background: '#ff9800',
    color: '#fff',
    borderRadius: '1.5rem',
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  statsSection: {
    padding: '3rem 2rem',
    background: 'rgba(22, 51, 124, 1)',
    color: '#fff',
  },
  statsContainer: {
    maxWidth: 1200,
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '2rem',
    textAlign: 'center' as const,
  },
  statItem: {
    padding: '1rem',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: 700,
    marginBottom: '0.5rem',
  },
  statLabel: {
    fontSize: '1rem',
    opacity: 0.9,
  },
  quickLinksSection: {
    padding: '4rem 2rem',
    background: 'rgba(255, 255, 255, 0.55)',
  },
  quickLinksGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1.5rem',
    maxWidth: 800,
    margin: '0 auto',
  },
  quickLinkCard: {
    background: '#f8f9fa',
    padding: '2rem',
    borderRadius: '1rem',
    textAlign: 'center' as const,
    textDecoration: 'none',
    color: '#333',
    transition: 'all 0.3s ease',
    border: '1px solid #e9ecef',
  },
  quickLinkCardHover: {
    background: 'var(--ifm-color-primary)',
    color: '#fff',
    transform: 'translateY(-3px)',
  },
  quickLinkIcon: {
    fontSize: '2rem',
    marginBottom: '1rem',
  },
  quickLinkTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  quickLinkDescription: {
    fontSize: '0.9rem',
    opacity: 0.8,
  },
};

// کامپوننت Hero Section
function HeroSection() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <section style={styles.heroSection}>
      <div style={styles.heroOverlay} />
      <div style={styles.heroContent}>
        <h1 style={styles.heroTitle}>{siteConfig.title}</h1>
        <p style={styles.heroSubtitle}>
          نماینده رسمی دانشجویان دانشگاه صنعتی شریف در امور صنفی و رفاهی
        </p>
        <div style={styles.heroButtons}>
          <Link
            to="/tree"
            style={{
              ...styles.heroButton,
              ...styles.primaryButton
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            شجره‌نامه شورا
          </Link>
          <Link
            to="/publications"
            style={{
              ...styles.heroButton,
              ...styles.secondaryButton
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--ifm-color-primary)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--ifm-color-primary)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
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
    <section style={styles.featuresSection}>
      <div style={styles.featuresContainer}>
        <h2 style={styles.sectionTitle}>نشریات و انتشارات</h2>
        <div style={styles.featuresGrid}>
          {publications.map((pub, index) => (
            <div
              key={index}
              style={styles.featureCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
              }}
            >
              <img src={pub.image} alt={pub.title} style={styles.featureImage} />
              <h3 style={styles.featureTitle}>{pub.title}</h3>
              {pub.status === 'download' ? (
                <a
                  href={pub.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.downloadLink}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--ifm-color-primary-dark)';
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--ifm-color-primary)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  دانلود
                </a>
              ) : (
                <span style={styles.comingSoon}>به‌زودی</span>
              )}
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
    <section style={styles.statsSection}>
      <div style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <div key={index} style={styles.statItem}>
            <div style={styles.statNumber}>{stat.number}</div>
            <div style={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// کامپوننت لینک‌های سریع
function QuickLinksSection() {
  const quickLinks = [
    {
      icon: '🌳',
      title: 'شجره‌نامه',
      description: 'تاریخچه و ساختار شورای صنفی',
      link: '/tree'
    },
    {
      icon: '📰',
      title: 'نشریه شورا',
      description: 'آرشیو کامل نشریات',
      link: '/publications'
    },
    {
      icon: '📢',
      title: 'کارزارها',
      description: 'کارزارهای فعال و گذشته',
      link: '/campaigns'
    }
  ];

  return (
    <section style={styles.quickLinksSection}>
      <div style={styles.featuresContainer}>
        <h2 style={styles.sectionTitle}>دسترسی سریع</h2>
        <div style={styles.quickLinksGrid}>
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              to={link.link}
              style={styles.quickLinkCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--ifm-color-primary)';
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.color = '#333';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={styles.quickLinkIcon}>{link.icon}</div>
              <h3 style={styles.quickLinkTitle}>{link.title}</h3>
              <p style={styles.quickLinkDescription}>{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// صفحه اصلی
export default function Home() {
  return (
    <Layout description="شورای صنفی دانشجویان دانشگاه صنعتی شریف - نماینده رسمی دانشجویان در امور صنفی و رفاهی">
      <HeroSection />
      <PublicationsSection />
      <StatsSection />
      <QuickLinksSection />
    </Layout>
  );
}
