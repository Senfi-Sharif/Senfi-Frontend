import React, { useState, useCallback, useMemo } from 'react';
import { useAuthApi } from '../api/auth';
import { useNotification } from '../contexts/NotificationContext';
import CampaignSignatures from './CampaignSignatures';
import SignCampaignButtons from './SignCampaignButtons';
import ConfirmModal from './ConfirmModal';
import CampaignCard from './CampaignCard';
import { useRef } from 'react';
import { FaClipboardList, FaHourglass, FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ApprovedCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [refreshTriggers, setRefreshTriggers] = useState<{[key: number]: number}>({});
  const [userSignatures, setUserSignatures] = useState<{[key: number]: any}>({});
  const { showNotification } = useNotification();
  const [refresh, setRefresh] = useState(0);
  const authApi = useAuthApi();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState<'signatures' | 'deadline' | 'created_at'>('signatures');

  // فیلترها
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSigned, setFilterSigned] = useState(true); // امضا شده
  const [filterUnsigned, setFilterUnsigned] = useState(true); // امضا نشده
  const [filterClosed, setFilterClosed] = useState(true); // کارزارهای بسته شده
  const [filterOpenCampaigns, setFilterOpenCampaigns] = useState(true); // کارزارهای باز
  const [statusFilterOpen, setStatusFilterOpen] = useState(false); // ساب‌منوی وضعیت کارزارها
  const [signatureFilterOpen, setSignatureFilterOpen] = useState(false); // ساب‌منوی امضا شده
  const filterRef = useRef<HTMLDivElement>(null);

  // بستن منو با کلیک بیرون
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  React.useEffect(() => {
    setLoading(true);
    authApi.getApprovedCampaigns()
      .then(async data => {
        // پشتیبانی از هر دو حالت خروجی: آرایه یا آبجکت
        const campaigns = Array.isArray(data) ? data : data.campaigns;
        setCampaigns(campaigns || []);
        setTotal((campaigns && campaigns.length) || 0);
        // فقط امضاهای کاربر برای کارزارهای جدید یا تغییر یافته را چک کن
        const signatures: {[key: number]: any} = { ...userSignatures };
        await Promise.all((campaigns || []).map(async (c: any) => {
          if (!(c.id in signatures)) {
            const sig = await authApi.checkUserSignature(c.id);
            signatures[c.id] = sig;
          }
        }));
        setUserSignatures(signatures);
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
        sig = await authApi.checkUserSignature(campaignId);
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
      await authApi.updateCampaignStatus(pendingId, undefined, 'pending');
      console.log('updateCampaignStatus finished', pendingId);
      showNotification('کارزار به حالت بررسی بازگردانده شد.', 'success');
      setRefresh(r => r + 1); // رفرش لیست بعد از تغییر وضعیت
      // فقط امضای همین کارزار را چک کن
      try {
        const sig = await authApi.checkUserSignature(pendingId);
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
  }, [pendingId, pendingLoading, authApi, showNotification]);

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

  // فیلتر نهایی
  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    // فیلتر امضا شده/نشده
    if (!filterSigned || !filterUnsigned) {
      result = result.filter((c: any) => {
        const hasSigned = !!userSignatures[c.id]?.has_signed;
        if (filterSigned && hasSigned) return true;
        if (filterUnsigned && !hasSigned) return true;
        return false;
      });
    }
    // فیلتر باز/بسته بودن کارزار
    const now = new Date();
    if (!filterClosed || !filterOpenCampaigns) {
      result = result.filter((c: any) => {
        const isClosed = c.end_datetime && new Date(c.end_datetime) < now;
        if (filterClosed && isClosed) return true;
        if (filterOpenCampaigns && !isClosed) return true;
        return false;
      });
    }
    if (search.trim()) {
    const s = search.trim().toLowerCase();
      result = result.filter((c: any) =>
      (c.title && c.title.toLowerCase().includes(s)) ||
      (c.description && c.description.toLowerCase().includes(s))
    );
    }
    // --- سورت ---
    let sorted = [...result];
    if (sortType === 'signatures') {
      sorted.sort((a, b) => (b.signatures_count || 0) - (a.signatures_count || 0));
    } else if (sortType === 'deadline') {
      sorted.sort((a, b) => {
        const aTime = a.end_datetime ? new Date(a.end_datetime).getTime() : 0;
        const bTime = b.end_datetime ? new Date(b.end_datetime).getTime() : 0;
        return aTime - bTime;
      });
    } else if (sortType === 'created_at') {
      sorted.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return bTime - aTime;
      });
    }
    return sorted;
  }, [campaigns, userSignatures, filterSigned, filterUnsigned, filterClosed, filterOpenCampaigns, search, sortType]);

  // لیست واحد همه کارزارها
  const allCampaigns = filteredCampaigns;

  const allChecked = campaigns.length === 0 || campaigns.every((c: any) => userSignatures.hasOwnProperty(c.id));
  if (!allChecked) {
    return (
      <div>
        <div className="approved-campaigns-checking-icon">⏳</div>
        <div>در حال بررسی وضعیت امضاها...</div>
      </div>
    );
  }

  return (
    <div
      className="approved-campaigns-container"
    >
      {/* سرچ بار و فیلتر */}
      <div className="approved-campaigns-search-container">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="جستجو در عنوان یا متن کارزار..."
          className="approved-campaigns-search-input"
        />
        <select
          value={sortType}
          onChange={e => setSortType(e.target.value as any)}
          className="approved-campaigns-sort-dropdown"
          style={{marginRight: '1em', borderRadius: '0.7em', padding: '0.5em 1em', fontSize: '1em', border: '1.5px solid var(--ifm-color-primary-lightest)', background: 'var(--ifm-color-white)', color: 'var(--ifm-color-primary-darkest)'}}
          title="مرتب‌سازی بر اساس"
        >
          <option value="signatures">بیشترین امضا</option>
          <option value="deadline">نزدیک‌ترین ددلاین</option>
          <option value="created_at">جدیدترین کارزار</option>
        </select>
        <div ref={filterRef} className="approved-campaigns-filter-container">
          <button
            onClick={() => setFilterOpen(f => !f)}
            className="campaigns-filter-btn"
          >
            <span>فیلتر</span>
            <span className="approved-campaigns-filter-icon">{filterOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
          </button>
          {filterOpen && (
            <div className="campaigns-filter-dropdown">
              <div className="approved-campaigns-filter-submenu-container">
                <button
                  type="button"
                  className="campaigns-filter-btn approved-campaigns-filter-submenu-btn"
                  onClick={() => setStatusFilterOpen(v => !v)}
                >
                  <span>وضعیت کارزارها</span>
                  <span className="approved-campaigns-filter-submenu-icon">{statusFilterOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                </button>
                {statusFilterOpen && (
                  <div className="campaigns-status-submenu">
                    <label>
                      <input type="checkbox" checked={filterClosed} onChange={e => setFilterClosed(e.target.checked)} />
                      <span>کارزارهای بسته شده</span>
                    </label>
                    <label>
                      <input type="checkbox" checked={filterOpenCampaigns} onChange={e => setFilterOpenCampaigns(e.target.checked)} />
                      <span>کارزارهای باز</span>
                    </label>
                  </div>
                )}
              </div>
              <div className="approved-campaigns-filter-submenu-container">
                <button
                  type="button"
                  className="campaigns-filter-btn approved-campaigns-filter-submenu-btn"
                  onClick={() => setSignatureFilterOpen(v => !v)}
                >
                  <span>وضعیت امضای من</span>
                  <span className="approved-campaigns-filter-submenu-icon">{signatureFilterOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
                </button>
                {signatureFilterOpen && (
                  <div className="campaigns-status-submenu">
                    <label>
                      <input type="checkbox" checked={filterSigned} onChange={e => setFilterSigned(e.target.checked)} />
                      <span>امضا شده</span>
                    </label>
                    <label>
                      <input type="checkbox" checked={filterUnsigned} onChange={e => setFilterUnsigned(e.target.checked)} />
                      <span>امضا نشده</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <h2 className="approved-campaigns-title">
        <FaClipboardList /> همه کارزارها
        {total > 0 && <span className="approved-campaigns-count"> ({total} کارزار)</span>}
      </h2>
      {loading && (
        <div>
          <div className="approved-campaigns-loading-icon">⏳</div>
          <div>در حال بارگذاری کارزارها...</div>
        </div>
      )}
      {error && (
        <div>
          <div className="approved-campaigns-error-icon">⚠️</div>
          {error}
        </div>
      )}
      {allCampaigns.length === 0 && !loading && (
        <div className="approved-campaigns-empty-container">
          <div className="approved-campaigns-empty-icon">📋</div>
          <div>هیچ کارزاری وجود ندارد</div>
        </div>
      )}
              <div>
        {allCampaigns.map((c: any) => (
          <CampaignCard
            key={c.id}
            c={c}
            isSigned={!!userSignatures[c.id]?.has_signed}
            userRole={authApi.getUserRole()}
            handleSetPending={handleSetPending}
            handleSignSuccess={handleSignSuccess}
          />
              ))}
      </div>
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