import React, { useState, useEffect, useMemo } from 'react';
import Layout from '@theme/Layout';
import { useAuthApi } from '../api/auth';
import { useNotification } from '../contexts/NotificationContext';
import ConfirmModal from '../components/ConfirmModal';
import StatsPanel from '../components/StatsPanel';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import { statsContainer, statItem, statNumber, statLabel } from '../theme/sharedStyles';



// کامپوننت کارت کارزار بهبود یافته
function CampaignCard({ campaign, onApprove, onReject, processing }) {
  const [isHovered, setIsHovered] = useState(false);
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
      className={`campaign-card ${isHovered ? 'campaign-card-hover' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="campaign-header">
        <h3 className="campaign-title">{campaign.title}</h3>
        <div className="campaign-date">
          {formatDate(campaign.created_at)}
        </div>
        {campaign.end_datetime && (
          <div className="campaign-end-date" style={{ color: '#b71c1c', fontWeight: 600, marginTop: 4 }}>
            🕒 پایان: {formatDate(campaign.end_datetime)}
          </div>
        )}
      </div>
      
      <div className={`campaign-type ${campaign.is_anonymous === 'anonymous' ? 'anonymous-type' : 'public-type'}`}>
        {campaign.is_anonymous === 'anonymous' ? '🔒 کارزار ناشناس' : '🌐 کارزار عمومی'}
      </div>
      
      <div className="campaign-description">
        {campaign.description}
      </div>
      
      {campaign.email && (
        <div className="campaign-email">
          <strong>📧 ایمیل:</strong> {campaign.email}
        </div>
      )}
      
      <div className="button-container">
        <button 
          onClick={() => onApprove(campaign)}
          disabled={isProcessing}
          className={`campaign-review-approve-button ${isProcessing ? 'campaign-review-approve-button-processing' : ''}`}
        >
          {isProcessing ? '⏳ در حال پردازش...' : '✅ تأیید'}
        </button>
        
        <button 
          onClick={() => onReject(campaign)}
          disabled={isProcessing}
          className={`campaign-review-reject-button ${isProcessing ? 'campaign-review-reject-button-processing' : ''}`}
        >
          {isProcessing ? '⏳ در حال پردازش...' : '❌ رد'}
        </button>
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
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'approve' | 'reject' | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [search, setSearch] = useState('');
  const authApi = useAuthApi();

  useEffect(() => {
    if (!authApi.hasAdminAccess()) {
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
      const data = await authApi.getPendingCampaigns();
      setCampaigns(Array.isArray(data.campaigns) ? data.campaigns : []);
    } catch (err) {
      setError(err.message || 'خطا در دریافت لیست کارزارها');
    } finally {
      setLoading(false);
    }
  };

  // فیلتر بر اساس سرچ
  const filteredCampaigns = useMemo(() => {
    if (!search.trim()) return campaigns;
    const s = search.trim().toLowerCase();
    return campaigns.filter(c =>
      (c.title && c.title.toLowerCase().includes(s)) ||
      (c.description && c.description.toLowerCase().includes(s))
    );
  }, [campaigns, search]);

  const handleApproveClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setModalType('approve');
    setModalOpen(true);
  };

  const handleRejectClick = (campaign: any) => {
    setSelectedCampaign(campaign);
    setModalType('reject');
    setModalOpen(true);
  };

  const handleModalConfirm = async () => {
    if (!selectedCampaign || !modalType) return;
    setModalOpen(false);
    setLoading(true);
    try {
      const approved = modalType === 'approve';
      const result = await authApi.updateCampaignStatus(selectedCampaign.id, approved);
      if (result.success) {
        loadCampaigns();
        showNotification(approved ? 'کارزار تایید شد.' : 'کارزار رد شد.', 'success');
      } else {
        showNotification(result.message || 'خطا در تغییر وضعیت کارزار', 'error');
      }
    } catch (err) {
      showNotification(err.message || 'خطا در تغییر وضعیت کارزار', 'error');
    } finally {
      setLoading(false);
      setSelectedCampaign(null);
      setModalType(null);
    }
  };

  const handleModalCancel = () => {
    setModalOpen(false);
    setSelectedCampaign(null);
    setModalType(null);
  };

  // بررسی دسترسی
  if (!authApi.hasAdminAccess()) {
    const currentRole = authApi.getUserRole();
    return (
      <div className="campaign-review-access-denied">
        <h3 className="campaign-review-access-denied-title">🚫 دسترسی محدود</h3>
        <p className="campaign-review-access-denied-text">
          شما دسترسی لازم برای مشاهده این صفحه را ندارید.
        </p>
        <div className="campaign-review-access-denied-role">
          <strong>نقش فعلی شما:</strong> {currentRole || 'هیچ نقشی'}
          <br />
          <small>این صفحه فقط برای کاربران با نقش superadmin، head یا center_member قابل دسترسی است.</small>
        </div>
      </div>
    );
  }

  const totalCampaigns = campaigns.length;
  const publicCampaigns = campaigns.filter(c => c.is_anonymous === 'public').length;
  const anonymousCampaigns = campaigns.filter(c => c.is_anonymous === 'anonymous').length;

  return (
    <div className="campaign-review-container">
      <div className="campaign-review-header">
        <h1 className="campaign-review-header-title">بررسی کارزارها</h1>
        <p className="campaign-review-header-subtitle">
          مدیریت و بررسی کارزارهای ارسال‌شده توسط دانشجویان
        </p>
      </div>
      
      {loading && (
        <LoadingSpinner message="در حال بارگذاری کارزارها..." />
      )}
      
      {error && (
        <ErrorMessage message={error} />
      )}
      
      {!loading && !error && campaigns.length > 0 && (
        <StatsPanel
          stats={[
            { icon: '📊', label: 'کل کارزارها', value: totalCampaigns },
            { icon: '🌐', label: 'کارزارهای عمومی', value: publicCampaigns },
            { icon: '🔒', label: 'کارزارهای ناشناس', value: anonymousCampaigns },
          ]}
        />
      )}
      
      {campaigns.length === 0 && !loading && !error && (
        <EmptyState 
          icon="🎉"
          title="هیچ کارزاری در انتظار بررسی وجود ندارد"
          subtitle="همه کارزارها بررسی شده‌اند!"
        />
      )}
      {/* سرچ بار */}
      <div className="campaign-review-search-container">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجو در عنوان یا متن کارزار..."
          className="campaign-review-search-input"
        />
      </div>
      <div className="campaign-review-campaigns-container">
        {loading ? (
          <LoadingSpinner message="در حال بارگذاری..." />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : campaigns.length === 0 ? null : (
          filteredCampaigns.length === 0 ? (
            <EmptyState 
              icon="📭"
              title="هیچ کارزاری مطابق جستجو یافت نشد"
              subtitle="لطفاً عبارت جستجوی دیگری را امتحان کنید"
            />
          ) : (
            filteredCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                onApprove={handleApproveClick}
                onReject={handleRejectClick}
                processing={processing}
              />
            ))
          )
        )}
      </div>

      <ConfirmModal
        open={modalOpen}
        title={modalType === 'approve' ? 'تایید کارزار' : 'رد کارزار'}
        message={modalType === 'approve' ? 'آیا از تایید این کارزار مطمئن هستید؟' : 'آیا از رد این کارزار مطمئن هستید؟'}
        confirmText={modalType === 'approve' ? 'تایید' : 'رد'}
        cancelText="انصراف"
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        loading={loading}
      />
    </div>
  );
}

// صفحه اصلی
export default function CampaignReview() {
  return (
    <Layout>
      <CampaignReviewPanel />
    </Layout>
  );
} 