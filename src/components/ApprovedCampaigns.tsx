import React, { useState, useCallback, useMemo } from 'react';
import { getApprovedCampaigns, checkUserSignature, updateCampaignStatus, getUserRole } from '../api/auth';
import { useNotification } from '../contexts/NotificationContext';
import CampaignSignatures from './CampaignSignatures';
import SignCampaignButtons from './SignCampaignButtons';
import ConfirmModal from './ConfirmModal';
import CampaignCard from './CampaignCard';
import { useColorMode } from '@docusaurus/theme-common';

const ApprovedCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [refreshTriggers, setRefreshTriggers] = useState<{[key: number]: number}>({});
  const [userSignatures, setUserSignatures] = useState<{[key: number]: any}>({});
  const { showNotification } = useNotification();
  const [refresh, setRefresh] = useState(0);
  const userRole = getUserRole();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [search, setSearch] = useState('');
  const { colorMode } = useColorMode();
  const isDark = colorMode === 'dark';
  const containerBg = isDark ? 'rgba(24,26,38,0.98)' : 'rgba(255,255,255,0.95)';
  const containerBorder = isDark ? '1.5px solid #637eda' : '1px solid #e0e7ff';
  const innerBoxBg = isDark ? 'rgba(30,34,54,0.95)' : 'rgba(245,245,245,0.98)';
  const innerBoxBorder = isDark ? '1px solid #637eda' : '1px solid #e0e7ff';

  React.useEffect(() => {
    setLoading(true);
    getApprovedCampaigns()
      .then(async data => {
        if (data.success && Array.isArray(data.campaigns)) {
          setCampaigns(data.campaigns);
          setTotal(data.total || data.campaigns.length);
          // فقط امضاهای کاربر برای کارزارهای جدید یا تغییر یافته را چک کن
          const signatures: {[key: number]: any} = { ...userSignatures };
          await Promise.all(data.campaigns.map(async (c: any) => {
            if (!(c.id in signatures)) {
              const sig = await checkUserSignature(c.id);
              signatures[c.id] = sig;
            }
          }));
          setUserSignatures(signatures);
        } else {
          setCampaigns([]);
          setTotal(0);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching approved campaigns:', err);
        showNotification(err.message || 'خطا در دریافت لیست کارزارها', 'error');
        setLoading(false);
      });
  }, [refresh]);

  // فقط امضای کارزار تغییر یافته را بعد از امضا یا تغییر وضعیت چک کن
  const handleSignSuccess = async (campaignId: number, signatureData?: any) => {
    setRefreshTriggers(prev => ({
      ...prev,
      [campaignId]: (prev[campaignId] || 0) + 1
    }));
    // امضای جدید را چک کن
    let sig = signatureData;
    if (!sig) {
      try {
        sig = await checkUserSignature(campaignId);
      } catch {}
    }
    setUserSignatures(prev => ({
      ...prev,
      [campaignId]: sig || { has_signed: true }
    }));
  };

  const handleSetPending = useCallback((campaignId: number) => {
    setPendingId(campaignId);
    setConfirmOpen(true);
  }, []);

  // بعد از بازگرداندن به بررسی فقط امضای همان کارزار را آپدیت کن
  const confirmSetPending = useCallback(async () => {
    console.log('confirmSetPending called', { pendingId, pendingLoading });
    if (!pendingId || pendingLoading) return;
    setPendingLoading(true);
    try {
      console.log('Calling updateCampaignStatus', pendingId);
      await updateCampaignStatus(pendingId, undefined, 'pending');
      console.log('updateCampaignStatus finished', pendingId);
      showNotification('کارزار به حالت بررسی بازگردانده شد.', 'success');
      setRefresh(r => r + 1); // رفرش لیست بعد از تغییر وضعیت
      // فقط امضای همین کارزار را چک کن
      try {
        const sig = await checkUserSignature(pendingId);
        setUserSignatures(prev => ({ ...prev, [pendingId]: sig }));
      } catch (err) {
        console.log('Error checking signature after setPending', err);
      }
    } catch (err: any) {
      console.log('Error in updateCampaignStatus', err);
      showNotification(err.message || 'خطا در بازگرداندن کارزار به حالت بررسی', 'error');
    } finally {
      setPendingLoading(false);
      setConfirmOpen(false);
      setPendingId(null);
    }
  }, [pendingId, pendingLoading, updateCampaignStatus, showNotification]);

  const handleCancelPending = useCallback(() => {
    setConfirmOpen(false);
    setPendingId(null);
    setPendingLoading(false);
  }, []);

  const formatDate = (dateString: string) => {
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

  // فیلتر بر اساس سرچ
  const filteredCampaigns = useMemo(() => {
    if (!search.trim()) return campaigns;
    const s = search.trim().toLowerCase();
    return campaigns.filter((c: any) =>
      (c.title && c.title.toLowerCase().includes(s)) ||
      (c.description && c.description.toLowerCase().includes(s))
    );
  }, [campaigns, search]);

  const unsignedCampaigns = filteredCampaigns.filter((c: any) => !userSignatures[c.id]?.has_signed);
  const signedCampaigns = filteredCampaigns.filter((c: any) => userSignatures[c.id]?.has_signed);

  const allChecked = campaigns.length === 0 || campaigns.every((c: any) => userSignatures.hasOwnProperty(c.id));
  if (!allChecked) {
    return (
      <div>
        <div style={{fontSize: '1.2rem', marginBottom: '1rem'}}>⏳</div>
        <div>در حال بررسی وضعیت امضاها...</div>
      </div>
    );
  }

  return (
    <div
      className="approved-campaigns-container"
      style={{
        borderRadius: 18,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        padding: 32,
        marginBottom: 32,
        // ...other styles
      }}
    >
      {/* سرچ بار */}
      <div style={{margin: '1.5rem 0', textAlign: 'center'}}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجو در عنوان یا متن کارزار..."
          style={{
            width: '100%',
            maxWidth: 400,
            padding: '0.8rem 1.2rem',
            borderRadius: '0.7rem',
            border: '1.5px solid var(--ifm-color-primary-lightest)',
            fontSize: '1.1rem',
            fontFamily: 'inherit',
            margin: '0 auto',
            boxShadow: '0 2px 8px rgba(22,51,124,0.06)',
            outline: 'none',
            direction: 'rtl',
          }}
        />
      </div>
      <h2 style={{fontSize: '1.5rem', marginBottom: '0.5rem'}}>
        📋 کارزارهای تاییدشده
        {total > 0 && <span style={{fontSize: '0.8em', color: 'var(--ifm-color-primary-dark)', fontWeight: 'normal'}}> ({total} کارزار)</span>}
      </h2>
      {loading && (
        <div>
          <div style={{fontSize: '1.2rem', marginBottom: '1rem'}}>⏳</div>
          <div>در حال بارگذاری کارزارها...</div>
        </div>
      )}
      {error && (
        <div>
          <div style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>⚠️</div>
          {error}
        </div>
      )}
      {campaigns.length === 0 && !loading && (
        <div>
          <div style={{fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem'}}>
            هنوز کارزاری تایید نشده است
          </div>
          <div style={{fontSize: '1rem', opacity: 0.8}}>
            کارزارهای ارسال‌شده پس از بررسی نمایندگان صنف در اینجا نمایش داده می‌شوند
          </div>
        </div>
      )}
      {/* Layout برای دسکتاپ */}
      <div className="desktop-layout" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
        {/* بخش کارزارهای امضا نشده */}
        <div style={{padding: '1rem', borderRadius: '8px', background: innerBoxBg, border: innerBoxBorder}}>
          <h3 style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>
            📝 کارزارهای امضا نشده ({unsignedCampaigns.length})
          </h3>
          <div style={{direction: 'rtl'}}>
            {unsignedCampaigns.map((c: any) => (
              <CampaignCard key={c.id} c={c} userRole={userRole} handleSetPending={handleSetPending} handleSignSuccess={handleSignSuccess} />
            ))}
            {unsignedCampaigns.length === 0 && (
              <div style={{textAlign: 'center', margin: '2rem auto'}}>
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🎉</div>
                <div>همه کارزارها را امضا کرده‌اید!</div>
              </div>
            )}
          </div>
        </div>
        {/* بخش کارزارهای امضا شده */}
        <div style={{padding: '1rem', borderRadius: '8px', background: innerBoxBg, border: innerBoxBorder}}>
          <h3 style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>
            ✅ کارزارهای امضا شده ({signedCampaigns.length})
          </h3>
          <div style={{direction: 'rtl'}}>
            {signedCampaigns.map((c: any) => (
              <CampaignCard key={c.id} c={c} isSigned={true} userRole={userRole} handleSetPending={handleSetPending} handleSignSuccess={handleSignSuccess} />
            ))}
            {signedCampaigns.length === 0 && (
              <div>
                <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📋</div>
                <div>هنوز هیچ کارزاری امضا نکرده‌اید</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Layout برای موبایل */}
      <div className="mobile-layout" style={{display: 'block'}}>
        {/* کارزارهای امضا نشده (بالا) */}
        <div style={{marginBottom: '2rem'}}>
          <div style={{padding: '1rem', borderRadius: '8px', background: innerBoxBg, border: innerBoxBorder}}>
            <h3 style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>
              📝 کارزارهای امضا نشده ({unsignedCampaigns.length})
            </h3>
            <div>
              {unsignedCampaigns.map((c: any) => (
                <CampaignCard key={c.id} c={c} userRole={userRole} handleSetPending={handleSetPending} handleSignSuccess={handleSignSuccess} />
              ))}
              {unsignedCampaigns.length === 0 && (
                <div>
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>🎉</div>
                  <div>همه کارزارها را امضا کرده‌اید!</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* کارزارهای امضا شده (پایین) */}
        <div>
          <div style={{padding: '1rem', borderRadius: '8px', background: innerBoxBg, border: innerBoxBorder}}>
            <h3 style={{fontSize: '1.2rem', marginBottom: '0.5rem'}}>
              ✅ کارزارهای امضا شده ({signedCampaigns.length})
            </h3>
            <div>
              {signedCampaigns.map((c: any) => (
                <CampaignCard key={c.id} c={c} isSigned={true} userRole={userRole} handleSetPending={handleSetPending} handleSignSuccess={handleSignSuccess} />
              ))}
              {signedCampaigns.length === 0 && (
                <div>
                  <div style={{fontSize: '2rem', marginBottom: '0.5rem'}}>📋</div>
                  <div>هنوز هیچ کارزاری امضا نکرده‌اید</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* CSS برای responsive */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-layout { display: none !important; }
          .mobile-layout { display: block !important; }
        }
        @media (min-width: 769px) {
          .desktop-layout { display: grid !important; }
          .mobile-layout { display: none !important; }
        }
      `}</style>
      <ConfirmModal
        open={confirmOpen}
        title="بازگرداندن کارزار به حالت بررسی"
        message="آیا مطمئن هستید که می‌خواهید این کارزار را به حالت بررسی بازگردانید؟"
        confirmText="بله، بازگردان به بررسی"
        cancelText="انصراف"
        onConfirm={confirmSetPending}
        onCancel={handleCancelPending}
        loading={pendingLoading}
      />
    </div>
  );
};

export default ApprovedCampaigns; 