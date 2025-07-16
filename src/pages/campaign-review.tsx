import React, { useState, useEffect } from 'react';
import Layout from '@theme/Layout';
import { getPendingCampaigns, updateCampaignStatus, hasAdminAccess, getUserRole } from '@site/src/api/auth';
import { useNotification } from '@site/src/contexts/NotificationContext';

// استایل‌های بهبود یافته
const styles = {
  container: {
    maxWidth: 1000,
    margin: '2rem auto',
    padding: '0 1rem',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
    padding: '2rem',
    background: 'linear-gradient(120deg, var(--ifm-color-primary-lightest) 0%, transparent 80%)',
    borderRadius: '1rem',
    border: '1px solid var(--ifm-color-primary-lighter)',
  },
  headerTitle: {
    fontSize: '2rem',
    fontWeight: 700,
    color: 'var(--ifm-color-primary-darker)',
    margin: '0 0 0.5rem 0',
  },
  headerSubtitle: {
    fontSize: '1rem',
    color: 'var(--ifm-color-primary-dark)',
    opacity: 0.8,
    margin: 0,
  },
  loadingContainer: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: 'var(--ifm-color-primary-dark)',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '1rem',
    border: '1px solid var(--ifm-color-primary-lighter)',
  },
  errorContainer: {
    color: '#b71c1c',
    fontWeight: 600,
    textAlign: 'center' as const,
    marginBottom: '1.5rem',
    padding: '1.5rem',
    background: 'rgba(255, 235, 238, 0.9)',
    borderRadius: '1rem',
    border: '1px solid #ffcdd2',
  },
  emptyContainer: {
    textAlign: 'center' as const,
    color: 'var(--ifm-color-primary-dark)',
    padding: '3rem',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '1rem',
    border: '1px solid var(--ifm-color-primary-lighter)',
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
    opacity: 0.6,
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
  campaignsContainer: {
    maxHeight: '70vh',
    overflowY: 'auto' as const,
    padding: '0.5rem',
  },
  campaignCard: {
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '1rem',
    marginBottom: '1rem',
    padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid var(--ifm-color-primary-lightest)',
    transition: 'all 0.3s ease',
  },
  campaignCardHover: {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  },
  campaignHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    gap: '1rem',
  },
  campaignTitle: {
    fontWeight: 700,
    fontSize: '1.2rem',
    margin: 0,
    color: 'var(--ifm-color-primary-darker)',
    flex: 1,
  },
  campaignDate: {
    fontSize: '0.9rem',
    color: 'var(--ifm-color-primary-dark)',
    opacity: 0.7,
    whiteSpace: 'nowrap' as const,
  },
  campaignType: {
    fontSize: '0.8rem',
    padding: '0.4rem 0.8rem',
    borderRadius: '1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    display: 'inline-block',
  },
  publicType: {
    background: 'rgba(76, 175, 80, 0.1)',
    color: '#2e7d32',
    border: '1px solid rgba(76, 175, 80, 0.3)',
  },
  anonymousType: {
    background: 'rgba(255, 152, 0, 0.1)',
    color: '#f57c00',
    border: '1px solid rgba(255, 152, 0, 0.3)',
  },
  campaignDescription: {
    fontSize: '1rem',
    marginBottom: '1rem',
    lineHeight: 1.6,
    whiteSpace: 'pre-line',
    color: 'var(--ifm-color-primary-darkest)',
  },
  campaignEmail: {
    fontSize: '0.9rem',
    color: 'var(--ifm-color-primary-dark)',
    marginBottom: '1rem',
    padding: '0.8rem 1rem',
    background: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '0.5rem',
    border: '1px solid var(--ifm-color-primary-lightest)',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
    marginTop: '1rem',
  },
  approveButton: {
    fontSize: '0.9rem',
    background: 'linear-gradient(135deg, #4caf50 0%, #388e3c 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.7rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
  },
  approveButtonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
  },
  rejectButton: {
    fontSize: '0.9rem',
    background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.7rem 1.5rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
  },
  rejectButtonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 4px 12px rgba(244, 67, 54, 0.4)',
  },
  accessDenied: {
    textAlign: 'center' as const,
    padding: '3rem',
    color: '#b71c1c',
    background: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '1rem',
    border: '1px solid #ffcdd2',
    maxWidth: 600,
    margin: '2rem auto',
  },
  accessDeniedTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '1rem',
  },
  accessDeniedText: {
    fontSize: '1rem',
    marginBottom: '1rem',
    lineHeight: 1.6,
  },
  accessDeniedRole: {
    fontSize: '0.9rem',
    color: '#666',
    marginTop: '1rem',
    padding: '1rem',
    background: 'rgba(0, 0, 0, 0.05)',
    borderRadius: '0.5rem',
  },
};

// کامپوننت کارت کارزار بهبود یافته
function CampaignCard({ campaign, onStatusUpdate, processing }) {
  const [isHovered, setIsHovered] = useState(false);
  const handleApprove = () => onStatusUpdate(campaign.id, true);
  const handleReject = () => onStatusUpdate(campaign.id, false);
  const isProcessing = processing[campaign.id];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      style={{
        ...styles.campaignCard,
        ...(isHovered && styles.campaignCardHover)
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.campaignHeader}>
        <h3 style={styles.campaignTitle}>{campaign.title}</h3>
        <div style={styles.campaignDate}>
          {formatDate(campaign.created_at)}
        </div>
      </div>
      
      <div style={{
        ...styles.campaignType,
        ...(campaign.is_anonymous === 'anonymous' ? styles.anonymousType : styles.publicType)
      }}>
        {campaign.is_anonymous === 'anonymous' ? '🔒 کارزار ناشناس' : '🌐 کارزار عمومی'}
      </div>
      
      <div style={styles.campaignDescription}>
        {campaign.description}
      </div>
      
      {campaign.email && (
        <div style={styles.campaignEmail}>
          <strong>📧 ایمیل:</strong> {campaign.email}
        </div>
      )}
      
      <div style={styles.buttonContainer}>
        <button 
          onClick={handleApprove}
          disabled={isProcessing}
          style={{
            ...styles.approveButton,
            opacity: isProcessing ? 0.6 : 1,
            transform: isProcessing ? 'scale(0.98)' : (isHovered ? 'translateY(-1px)' : 'scale(1)'),
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              (e.target as HTMLElement).style.transform = 'translateY(-1px)';
              (e.target as HTMLElement).style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              (e.target as HTMLElement).style.transform = 'scale(1)';
              (e.target as HTMLElement).style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
            }
          }}
        >
          {isProcessing ? '⏳ در حال پردازش...' : '✅ تأیید'}
        </button>
        
        <button 
          onClick={handleReject}
          disabled={isProcessing}
          style={{
            ...styles.rejectButton,
            opacity: isProcessing ? 0.6 : 1,
            transform: isProcessing ? 'scale(0.98)' : (isHovered ? 'translateY(-1px)' : 'scale(1)'),
          }}
          onMouseEnter={(e) => {
            if (!isProcessing) {
              const target = e.target as HTMLElement;
              target.style.transform = 'translateY(-1px)';
              target.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isProcessing) {
              const target = e.target as HTMLElement;
              target.style.transform = 'scale(1)';
              target.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)';
            }
          }}
        >
          {isProcessing ? '⏳ در حال پردازش...' : '❌ رد'}
        </button>
      </div>
    </div>
  );
}

// کامپوننت آمار بهبود یافته
function StatsPanel({ campaigns }) {
  const totalCampaigns = campaigns.length;
  const publicCampaigns = campaigns.filter(c => c.is_anonymous === 'public').length;
  const anonymousCampaigns = campaigns.filter(c => c.is_anonymous === 'anonymous').length;

  return (
    <div style={styles.statsContainer}>
      <div style={styles.statItem}>
        <div style={styles.statNumber}>📊 {totalCampaigns}</div>
        <div style={styles.statLabel}>کل کارزارها</div>
      </div>
      <div style={styles.statItem}>
        <div style={styles.statNumber}>🌐 {publicCampaigns}</div>
        <div style={styles.statLabel}>کارزارهای عمومی</div>
      </div>
      <div style={styles.statItem}>
        <div style={styles.statNumber}>🔒 {anonymousCampaigns}</div>
        <div style={styles.statLabel}>کارزارهای ناشناس</div>
      </div>
    </div>
  );
}

// کامپوننت اصلی بهبود یافته
function CampaignReviewPanel() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState({});
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!hasAdminAccess()) {
      setError('شما دسترسی لازم برای مشاهده این صفحه را ندارید.');
      setLoading(false);
      return;
    }
    
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getPendingCampaigns();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'خطا در دریافت لیست کارزارها');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (campaignId: number, approved: boolean) => {
    try {
      setLoading(true);
      const result = await updateCampaignStatus(campaignId, approved);
      if (result.success) {
        // Refresh the campaigns list
        loadCampaigns();
        showNotification(`کارزار ${approved ? 'تایید' : 'رد'} شد`, 'success');
      } else {
        showNotification('خطا در بروزرسانی وضعیت کارزار', 'error');
      }
    } catch (error) {
      showNotification('خطا در بروزرسانی وضعیت کارزار', 'error');
    } finally {
      setLoading(false);
    }
  };

  // بررسی دسترسی
  if (!hasAdminAccess()) {
    const currentRole = getUserRole();
    return (
      <div style={styles.accessDenied}>
        <h3 style={styles.accessDeniedTitle}>🚫 دسترسی محدود</h3>
        <p style={styles.accessDeniedText}>
          شما دسترسی لازم برای مشاهده این صفحه را ندارید.
        </p>
        <div style={styles.accessDeniedRole}>
          <strong>نقش فعلی شما:</strong> {currentRole || 'هیچ نقشی'}
          <br />
          <small>این صفحه فقط برای کاربران با نقش superadmin، head یا center_member قابل دسترسی است.</small>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>بررسی کارزارها</h1>
        <p style={styles.headerSubtitle}>
          مدیریت و بررسی کارزارهای ارسال‌شده توسط دانشجویان
        </p>
      </div>
      
      {loading && (
        <div style={styles.loadingContainer}>
          <div style={{fontSize: '1.2rem', marginBottom: '1rem'}}>⏳</div>
          <div>در حال بارگذاری کارزارها...</div>
        </div>
      )}
      
      {error && (
        <div style={styles.errorContainer}>
          <div style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>⚠️</div>
          {error}
        </div>
      )}
      
      {!loading && !error && campaigns.length > 0 && (
        <StatsPanel campaigns={campaigns} />
      )}
      
      {campaigns.length === 0 && !loading && !error && (
        <div style={styles.emptyContainer}>
          <div style={styles.emptyIcon}>🎉</div>
          <div style={{fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem'}}>
            هیچ کارزاری در انتظار بررسی وجود ندارد
          </div>
          <div style={{fontSize: '1rem', opacity: 0.8}}>
            همه کارزارها بررسی شده‌اند!
          </div>
        </div>
      )}
      
      {campaigns.length > 0 && (
        <div style={styles.campaignsContainer}>
          {campaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              onStatusUpdate={handleStatusUpdate}
              processing={processing}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// صفحه اصلی
export default function CampaignReview() {
  return (
    <Layout title="بررسی کارزارها" description="صفحه بررسی و مدیریت کارزارهای ارسال‌شده">
      <CampaignReviewPanel />
    </Layout>
  );
} 