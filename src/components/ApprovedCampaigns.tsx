import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { useAuthApi } from '../api/auth';
import { useNotification } from '../contexts/NotificationContext';
import CampaignSignatures from './CampaignSignatures';
import SignCampaignButtons from './SignCampaignButtons';
import ConfirmModal from './ConfirmModal';
import CampaignCard from './CampaignCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';
import { FaClipboardList, FaHourglass, FaExclamationTriangle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import '../css/approvedCampaigns.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

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
  const [search, setSearch] = useState('');
  const [sortType, setSortType] = useState<'signatures' | 'deadline' | 'created_at'>('created_at');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // فیلترها
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSigned, setFilterSigned] = useState(true); // امضا شده
  const [filterUnsigned, setFilterUnsigned] = useState(true); // امضا نشده
  const [filterClosed, setFilterClosed] = useState(true); // کارزارهای بسته شده
  const [filterOpenCampaigns, setFilterOpenCampaigns] = useState(true); // کارزارهای باز
  const [statusFilterOpen, setStatusFilterOpen] = useState(false); // ساب‌منوی وضعیت کارزارها
  const [signatureFilterOpen, setSignatureFilterOpen] = useState(false); // ساب‌منوی امضا شده
  const filterRef = useRef<HTMLDivElement>(null);

  // تعریف refها و stateهای اندازه برای هر دکمه و dropdown
  const labelButtonRef = useRef<HTMLButtonElement>(null);
  const [labelDropdownWidth, setLabelDropdownWidth] = useState<number>(0);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const [sortDropdownWidth, setSortDropdownWidth] = useState<number>(0);
  const signButtonRef = useRef<HTMLButtonElement>(null);
  const [signDropdownWidth, setSignDropdownWidth] = useState<number>(0);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const [statusDropdownWidth, setStatusDropdownWidth] = useState<number>(0);
  // اندازه‌گیری داینامیک بعد از mount و هر بار resize
  useEffect(() => {
    function updateWidths() {
      if (labelButtonRef.current) setLabelDropdownWidth(labelButtonRef.current.offsetWidth);
      if (sortButtonRef.current) setSortDropdownWidth(sortButtonRef.current.offsetWidth);
      if (signButtonRef.current) setSignDropdownWidth(signButtonRef.current.offsetWidth);
      if (statusButtonRef.current) setStatusDropdownWidth(statusButtonRef.current.offsetWidth);
    }
    updateWidths();
    window.addEventListener('resize', updateWidths);
    return () => window.removeEventListener('resize', updateWidths);
  }, []);

  const FACULTY_CHOICES = [
    "فیزیک", "صنایع", "کامپیوتر", "برق", "عمران", "مواد", "مهندسی شیمی و نفت", "ریاضی", "هوافضا", "انرژی", "مدیریت و اقتصاد", "شیمی", "مکانیک"
  ];
  const DORMITORY_CHOICES = [
    "احمدی روشن", "طرشت ۲", "طرشت ۳"
  ];

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

  // دسته‌بندی‌های قابل مشاهده فقط از campaigns دریافتی
  const visibleCategories = useMemo(() => {
    const set = new Set<string>();
    (campaigns || []).forEach((c: any) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set);
  }, [campaigns]);
  
  // اضافه کردن state برای دسته‌بندی‌ها
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const { siteConfig } = useDocusaurusContext();
  const API_BASE = siteConfig.customFields.apiUrl;

  useEffect(() => {
    setCategoriesLoading(true);
    fetch(`${API_BASE}/campaigns/categories`)
      .then(res => res.json())
      .then(data => {
        setAllCategories(data.categories || []);
        setCategoriesLoading(false);
      })
      .catch(err => {
        setCategoriesError('خطا در دریافت دسته‌بندی‌ها');
        setCategoriesLoading(false);
      });
  }, []);

  // جایگزینی ALL_CATEGORIES با allCategories در کل فایل
  const ALL_CATEGORIES = useMemo(() => {
    const combined = new Set([...visibleCategories, ...allCategories]);
    return Array.from(combined).sort();
  }, [visibleCategories, allCategories]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>(ALL_CATEGORIES);
  useEffect(() => { setCategoryFilter(ALL_CATEGORIES); }, [JSON.stringify(ALL_CATEGORIES)]);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // هندل تغییر چک‌باکس دسته‌بندی
  const handleCategoryCheckbox = (cat: string) => {
    setCategoryFilter(prev =>
      prev.includes(cat)
        ? prev.filter(l => l !== cat)
        : [...prev, cat]
    );
  };

  // متن خلاصه انتخاب‌شده‌ها
  const categorySummary = categoryFilter.length === ALL_CATEGORIES.length
    ? 'همه دسته‌بندی‌ها'
    : categoryFilter.length === 0
      ? 'هیچ دسته‌بندی انتخاب نشده'
      : categoryFilter.length <= 2
        ? categoryFilter.join('، ')
        : `${categoryFilter.length} دسته‌بندی انتخاب شده`;

  // فیلتر امضا شده/نشده
  const SIGN_FILTERS = [
    { key: 'signed', label: 'امضا شده', value: filterSigned },
    { key: 'unsigned', label: 'امضا نشده', value: filterUnsigned },
  ];
  const [signFilter, setSignFilter] = useState<string[]>(['signed', 'unsigned']);
  const [signDropdownOpen, setSignDropdownOpen] = useState(false);
  const signDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (signDropdownRef.current && !signDropdownRef.current.contains(event.target as Node)) {
        setSignDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // بستن منو سورت با کلیک بیرون
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  // sync with old checkboxes for backward compatibility
  useEffect(() => {
    setFilterSigned(signFilter.includes('signed'));
    setFilterUnsigned(signFilter.includes('unsigned'));
  }, [signFilter]);
  const signSummary = signFilter.length === 2 ? 'همه وضعیت‌ها' : signFilter.length === 0 ? 'هیچ' : signFilter.map(f => SIGN_FILTERS.find(x => x.key === f)?.label).join('، ');

  // فیلتر باز/بسته
  const STATUS_FILTERS = [
    { key: 'open', label: 'باز', value: filterOpenCampaigns },
    { key: 'closed', label: 'بسته', value: filterClosed },
  ];
  const [statusFilter, setStatusFilter] = useState<string[]>(['open', 'closed']);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setStatusDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  useEffect(() => {
    setFilterOpenCampaigns(statusFilter.includes('open'));
    setFilterClosed(statusFilter.includes('closed'));
  }, [statusFilter]);
  const statusSummary = statusFilter.length === 2 ? 'همه وضعیت‌ها' : statusFilter.length === 0 ? 'هیچ' : statusFilter.map(f => STATUS_FILTERS.find(x => x.key === f)?.label).join('، ');

  // فیلتر سورت
  const SORT_FILTERS = [
    { key: 'created_at', label: 'جدیدترین' },
    { key: 'signatures', label: 'بیشترین امضا' },
    { key: 'deadline', label: 'نزدیک‌ترین ددلاین' },
  ];
  const sortSummary = SORT_FILTERS.find(f => f.key === sortType)?.label || 'جدیدترین';

  // فیلتر نهایی
  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    // فیلتر بر اساس دسته‌بندی
    if (categoryFilter.length > 0) {
      result = result.filter((c: any) => categoryFilter.includes(c.category));
    }
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
  }, [campaigns, userSignatures, filterSigned, filterUnsigned, filterClosed, filterOpenCampaigns, search, sortType, categoryFilter]);

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
    <div className="approved-campaigns-container">
      {/* فیلتر لیبل به صورت دراپ‌داون مولتی‌سِلکت */}
      <div className="filters-container">
        {/* فیلتر لیبل */}
        {ALL_CATEGORIES.length > 0 && (
          <div ref={categoryDropdownRef} className="dropdown-container">
            <button
              ref={labelButtonRef}
              type="button"
              onClick={() => setCategoryDropdownOpen(v => !v)}
              className={`dropdown-button ${categoryDropdownOpen ? 'active' : ''}`}
              title={categorySummary}
            >
              <span className="dropdown-button-text">{categorySummary}</span>
              <span className="dropdown-arrow">
                {categoryDropdownOpen ? '▲' : '▼'}
              </span>
            </button>
            {categoryDropdownOpen && (
              <div 
                className="dropdown-menu"
                style={{
                  minWidth: labelDropdownWidth || 120,
                  width: labelDropdownWidth || 'auto',
                }}
              >
                {ALL_CATEGORIES.map(l => (
                  <label key={l} className="dropdown-checkbox-label">
                    <input
                      type="checkbox"
                      checked={categoryFilter.includes(l)}
                      onChange={() => handleCategoryCheckbox(l)}
                      className="dropdown-checkbox"
                    />
                    {l}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
        {/* بقیه فیلترها و سرچ */}
        {/* سورت */}
        <div ref={sortDropdownRef} className="dropdown-container">
          <button
            ref={sortButtonRef}
            type="button"
            onClick={() => setSortDropdownOpen(v => !v)}
            className={`dropdown-button ${sortDropdownOpen ? 'active' : ''}`}
            title={sortSummary}
          >
            <span className="dropdown-button-text">{sortSummary}</span>
            <span className="dropdown-arrow">{sortDropdownOpen ? '▲' : '▼'}</span>
          </button>
          {sortDropdownOpen && (
            <div 
              className="dropdown-menu"
              style={{
                minWidth: sortDropdownWidth || 120,
                width: sortDropdownWidth || 'auto',
                maxWidth: 220,
                maxHeight: 200,
              }}
            >
              {SORT_FILTERS.map(f => (
                <label key={f.key} className="dropdown-checkbox-label">
                  <input
                    type="radio"
                    name="sortType"
                    checked={sortType === f.key}
                    onChange={() => setSortType(f.key as any)}
                    className="dropdown-checkbox"
                  />
                  {f.label}
                </label>
              ))}
          </div>
          )}
        </div>
        {/* فیلتر امضا شده/نشده به صورت دراپ‌داون */}
        <div ref={signDropdownRef} className="dropdown-container">
          <button
            ref={signButtonRef}
            type="button"
            onClick={() => setSignDropdownOpen(v => !v)}
            className={`dropdown-button ${signDropdownOpen ? 'active' : ''}`}
            title={signSummary}
          >
            <span className="dropdown-button-text">{signSummary}</span>
            <span className="dropdown-arrow">{signDropdownOpen ? '▲' : '▼'}</span>
          </button>
          {signDropdownOpen && (
            <div 
              className="dropdown-menu"
              style={{
                minWidth: signDropdownWidth || 120,
                width: signDropdownWidth || 'auto',
                maxWidth: 220,
                maxHeight: 200,
              }}
            >
              {SIGN_FILTERS.map(f => (
                <label key={f.key} className="dropdown-checkbox-label">
                  <input
                    type="checkbox"
                    checked={signFilter.includes(f.key)}
                    onChange={() => setSignFilter(prev => prev.includes(f.key) ? prev.filter(x => x !== f.key) : [...prev, f.key])}
                    className="dropdown-checkbox"
                  />
                  {f.label}
                </label>
              ))}
            </div>
          )}
        </div>
        {/* فیلتر باز/بسته به صورت دراپ‌داون */}
        <div ref={statusDropdownRef} className="dropdown-container">
          <button
            ref={statusButtonRef}
            type="button"
            onClick={() => setStatusDropdownOpen(v => !v)}
            className={`dropdown-button ${statusDropdownOpen ? 'active' : ''}`}
            title={statusSummary}
          >
            <span className="dropdown-button-text">{statusSummary}</span>
            <span className="dropdown-arrow">{statusDropdownOpen ? '▲' : '▼'}</span>
          </button>
          {statusDropdownOpen && (
            <div 
              className="dropdown-menu"
              style={{
                minWidth: statusDropdownWidth || 120,
                width: statusDropdownWidth || 'auto',
                maxWidth: 220,
                maxHeight: 200,
              }}
            >
              {STATUS_FILTERS.map(f => (
                <label key={f.key} className="dropdown-checkbox-label">
                  <input
                    type="checkbox"
                    checked={statusFilter.includes(f.key)}
                    onChange={() => setStatusFilter(prev => prev.includes(f.key) ? prev.filter(x => x !== f.key) : [...prev, f.key])}
                    className="dropdown-checkbox"
                  />
                  {f.label}
                </label>
              ))}
            </div>
          )}
        </div>
        {/* سرچ بار آخر ردیف */}
        <input
          type="text"
          placeholder="جستجو..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="search-input"
          style={{
            minWidth: 140,
            order: 10,
          }}
        />
      </div>
      <h2 className="approved-campaigns-title">
        <FaClipboardList /> همه کارزارها
        {total > 0 && <span className="approved-campaigns-count"> ({total} کارزار)</span>}
      </h2>
      {loading && (
        <LoadingSpinner message="در حال بارگذاری کارزارها..." />
      )}
      {error && (
        <ErrorMessage message={error} />
      )}
      {allCampaigns.length === 0 && !loading && (
        <EmptyState 
          icon="📋"
          title="هیچ کارزاری وجود ندارد"
          subtitle="در حال حاضر هیچ کارزاری برای نمایش موجود نیست"
        />
      )}
              <div>
        {allCampaigns.map((c: any) => (
          <CampaignCard
            key={c.id}
            c={c}
            isSigned={!!userSignatures[c.id]?.has_signed}
            userRole={authApi.getUserRole()}
          />
              ))}
      </div>
    </div>
  );
};

export default ApprovedCampaigns; 